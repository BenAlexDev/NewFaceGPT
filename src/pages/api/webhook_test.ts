import { NextApiRequest, NextApiResponse } from "next";
import { getSuggestionsFromGPT } from "@/utils/server/generate-suggestions";
import { supabaseAdmin } from "@/utils/server/supabase-admin";
type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await saveComments(req.body);
  if (req.method === "POST") {
    console.log(req.body, "boddyydd");
    console.log("------------Entry------------");
    console.log(req.body.entry);
    console.log("------------changes------------");
    console.log(req.body.entry[0].changes);
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
  // for (let k = 0; k < entry.length; k++) {

  //   const changes = entry[k].changes;
  //   console.log("----------Changes-------------");
  //   console.log(changes);
    
  //   for (let j = 0; j < changes.length; j++) {

      const value = {
        from: { id: '7045289545481722', name: 'Sandra Stu' },
        post: {
          status_type: 'added_video',
          is_published: false,
          updated_time: '2023-09-29T22:01:43+0000',
          permalink_url: 'https://www.facebook.com/102041614815098/posts/pfbid02Tvc2PjriD9J6YyQ5xaSBaESvd5qNUk5T6uNuPUAMzfkfQkVGqrVvZzwAPEq1PcB1l/',
          promotion_status: 'ineligible',
          id: '102041614815098_383190773366846'
        },
        message: 'WunderRein Weiter unten schreibt ihr NICHT für Glas?',
        post_id: '102041614815098_383190773366846',
        comment_id: '383190773366846_3274119599545228',
        created_time: 1696024903,
        item: 'comment',
        parent_id: '383190773366846_1280927162652731',
        verb: 'add'
      };

      console.log("---------Value--------");
    

      const post_id = value.post_id;
      const page_id = post_id.split("_")[0];
      const comment_id = value.comment_id;

      console.log("--------------Page Id-----------");
      console.log(page_id);
      
      const brand_data = await getBrand(page_id);
    
      console.log("-----------Brand Data-------------");
      console.log(brand_data);


      const brand_id = brand_data.id;
      const brand_name = brand_data.name;
      const from_name = value.from.name;
      const from_id = value.from.id;
      const message = value.message;
      const create_time = value.post.updated_time;
      const access_token = await getAccessToken(brand_id);
      
      console.log("-----------Access Token-------------");
      console.log(access_token);

      let post_caption = '';

      if (Object.keys(value).includes('post')) {
        post_caption = await getPostCaption(value.post.id, access_token);
      }
      console.log("------------Post caption-------------");
      console.log(post_caption);

      const comments_data = await getCommentsData(comment_id, access_token);
      let parent_comment: any = {
        "empty":true
      };

      if (comments_data) {
        let comment_history: any = [];
        if (Object.keys(comments_data).includes("parent")) {
          comment_history = comments_data.parent.comments.data;
          parent_comment = {
            created_time: comments_data.parent.created_time,
            from: comments_data.parent.from,
            message: comments_data.parent.message
          }
        }
        const permalink_url = comments_data.permalink_url;
        const gpt_data: any = await getSuggestionsFromGPT(
          {
            post_caption,
            comment_history,
            store_answers: false,
            parent_comment
          },
          brand_id,
          message
        );
        const suggestions = gpt_data.suggestions;
        const prompt = gpt_data.prompt;
        
        if (suggestions) {
          const content = suggestions[0].message.content;
          const parsed_content = JSON.parse(content);
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
              post_id
            }]);
            console.log("-------------Saved Result----------------");
            console.log(saved);
          }
        }
      }
    }
//   }
// }

const getCommentsData = async (comment_id: string, access_token: string) => {
  const url = `https://graph.facebook.com/${comment_id}?fields=object,comments{created_time,from,message,comments},parent{created_time,from,message,comments},message,permalink_url,from&access_token=${access_token}`;
  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    console.log("------------Comment History-------")
    console.log(data);
    return data;
  } else {
    return false;
  }
}

const getPostCaption = async (post_id: string, access_token: string) => {
  const url = `https://graph.facebook.com/${post_id}?access_token=${access_token}`
  console.log("-----------Post Caption Url----------");
  console.log(url);

  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    const message = data.message;
    return message;
  } else {
    return '';
  }
}

const getBrand = async(brand_id: string) => {
  const { error, data} = await supabaseAdmin.from("brands").select("*").eq("page_id", brand_id);
  if(data && data.length) {
    return data[0];
  } else {
    return false;
  }
}

const getAccessToken = async(brand_id: string) => {
  const { error, data} = await supabaseAdmin.from('sources').select("*").eq("brand_id", brand_id).neq("access_token", null);
  console.log(data);

  if(data && data.length > 0) {
    return data[0].access_token;
  } else {
    return '';
  }
}

