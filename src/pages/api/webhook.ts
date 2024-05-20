import { NextApiRequest, NextApiResponse } from "next";
import { getSuggestionsFromGPT } from "@/utils/server/generate-suggestions";
import { supabaseAdmin } from "@/utils/server/supabase-admin";
import axios from "axios";
import { handleSuggestion } from "./new_comments/save_suggestion";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  console.log(req.body, "boddyydd");
  if (req.method === "POST") {
    console.log("------------Entry------------");
    console.log(req.body.entry);
    console.log("------------changes------------");
    console.log(req.body.entry[0].changes);
    await saveComments(req.body);
    res.status(200).send(req.body);

  } else {
    const VERIFY_TOKEN = "token_for_facebook";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge: any = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.status(403);
      }
    }
  }
}

const saveComments = async (comments: any) => {
  const entry = comments.entry;
  console.log("---------End entry------")
  for (let k = 0; k < entry.length; k++) {

    const changes = entry[k].changes;
    console.log("----------Changes-------------");
    console.log(changes);

    for (let j = 0; j < changes.length; j++) {

      const value = changes[j].value;
      console.log("---------Value--------");
      console.log(value);

      if (value.item != "comment") {
        continue;
      }

      const post_id = value.post_id;
      const page_id = post_id.split("_")[0];
      const comment_id = value.comment_id;
      if (page_id == value.from.id) continue;

      console.log("--------------Page Id-----------");
      console.log(page_id);

      const source_data = await getSource(page_id);

      if (!source_data) {
        continue;
      }

      const brand_id = source_data.brand_id;
      const from_name = value.from.name;
      const from_id = value.from.id;

      const message = value.message;
      const create_time = value.post.updated_time;
      const access_token = source_data.fb_access_token;
      const page_name = source_data.path;

      let attachments = {};
      let post_caption = '';

      if (Object.keys(value).includes('post')) {
        const post_data: any = await getPostCaption(value.post.id, access_token);
        post_caption = post_data.message;
        attachments = post_data.attachments
      }

      console.log("------------Post caption-------------");
      console.log(post_caption);

      console.log("-----------Access Token-------------");
      console.log(access_token);

      const comments_data = await getCommentsData(comment_id, access_token);
      let parent_comment: any = {};
      if (comments_data) {
        let comment_history: any = [];
        if (Object.keys(comments_data).includes("parent")) {
          const _comment_history = comments_data.parent.comments.data;
          _comment_history.map((item: any) => {
            if (item.id != comment_id) {
              comment_history.push(item);
            }
          });
          parent_comment = {
            created_time: comments_data.parent.created_time,
            from: comments_data.parent.from,
            message: comments_data.parent.message
          }
        }

        const permalink_url = comments_data.permalink_url;
        const from_picture = comments_data.from.picture.data.url;
        const gpt_data: any = await getSuggestionsFromGPT(
          {
            post_caption,
            comment_history,
            store_answers: false,
            parent_comment: JSON.stringify({
              parent_comment,
              comment_history
            })
          },
          brand_id,
          message
        );
        const suggestions = gpt_data.suggestions;
        const prompt = gpt_data.prompt;

        if (suggestions) { /** If there are no matched sections, only save not'sure message in database */
          let parsed_content: any = [
            "I'm not sure the suggestions based on trained data",
            "I'm not sure the suggestions based on trained data",
            "I'm not sure the suggestions based on trained data",
          ]
          try {
            const content = suggestions[0].message.content;
            parsed_content = JSON.parse(content);
          } catch (e) {
            console.log(e);
          }
          const status = await getStatus(brand_id);
          const chk_exist = await supabaseAdmin.from("webhook").select("*").eq("comment_id", comment_id);
          if (chk_exist.data && chk_exist.data.length == 0) {
            const saved = await supabaseAdmin.from('webhook').insert([{
              comment_history,
              message,
              post_caption,
              suggestions: parsed_content,
              permalink_url,
              create_time,
              from_id,
              from_name,
              comment_id,
              page_id,
              brand_id,
              prompt,
              parent_comment,
              post_id,
              page_name,
              status,
              picture: from_picture,
              attachments
            }]);
            console.log("-------------Saved Result----------------");
            console.log(saved);
            if(status == "automatic"){
              await postSuggestion(comment_id, parsed_content[0], access_token)
            }
          }
        }
      }
    }
  }
}

const getStatus = async(brand_id: string) => {
  const {data, error} = await supabaseAdmin.from("cron_status").select("*").eq("brand_id", brand_id);
  let status = "";
  if(data && data.length > 0){
      status = data[0]['status']
  }
  return status;
}

const getCommentsData = async (comment_id: string, access_token: string) => {
  const url = `https://graph.facebook.com/${comment_id}?fields=object,comments{created_time,from,message,comments},parent{created_time,from,message,comments},message,permalink_url,from{picture.width(150).height(150),name,id}&access_token=${access_token}`;
  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    console.log("------------Comment History-------")
    console.log(data);
    return data;
  } else {
    console.log("----------Comment History Error-------")
    return false;
  }
}

const getPostCaption = async (post_id: string, access_token: string) => {
  const url = `https://graph.facebook.com/${post_id}?fields=created_time,message,attachments{media_type,media},id&access_token=${access_token}`
  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    const message = data.message;
    const attachments = data.attachments.data[0];
    return { message, attachments };
  } else {
    console.log("----------Comment History Error-------")
    return '';
  }
}

const getSource = async (page_id: string) => {
  const { error, data } = await supabaseAdmin.from("sources").select("*").eq("fb_page_id", page_id);
  if (data && data.length) {
    return data[0];
  } else {
    return false;
  }
}

const getAccessToken = async (brand_id: string) => {
  const { error, data } = await supabaseAdmin.from('sources').select("*").eq("brand_id", brand_id).neq("fb_access_token", null);
  console.log(data);

  if (data && data.length > 0) {
    return data[0].access_token;
  } else {
    return '';
  }
}

const postSuggestion = async (comment_id: string, suggestion: string, access_token: string) => {
  
  if (!access_token) {
    return;
  }

  if (suggestion == "LIKE") {
    await axios.post(
      `https://graph.facebook.com/${comment_id}/likes?access_token=${access_token}`
    );
  } else if (suggestion == "HIDE") {
    await axios.post(
      `https://graph.facebook.com/${comment_id}?access_token=${access_token}&is_hidden=true`
    );
  } else {
    await axios.post(
      `https://graph.facebook.com/${comment_id}/comments?access_token=${access_token}`,
      {
        message: suggestion,
      }
    );
  }

  handleSuggestion(comment_id, "0", suggestion)
}
