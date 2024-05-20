import { NextApiRequest, NextApiResponse } from "next";
import { getSuggestionsFromGPT } from "@/utils/server/generate-suggestions";
import { supabaseAdmin } from "@/utils/server/supabase-admin";
import axios from "axios";
import { handleSuggestion } from "./new_comments/save_suggestion";
import { convertDateForDB, convertDateIso } from "@/utils/app/global";

type Data = {
    name: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // const data = {"entry":[{"id":"17841449134856501","time":1701284314,"changes":[{"value":{"from":{"id":"6874343885992336","username":"jenny.dree"},"media":{"id":"17931099422661675","media_product_type":"AD","ad_id":"23859589939300145","ad_title":"Video China V1 - Cut am Anfang"},"id":"18031837237676194","parent_id":"18320987938111300","text":"Okay. Vielleicht probiere ich es wirklich mal aus."},"field":"comments"}]}],"object":"instagram"};
    // saveComments(data.entry);
    // res.status(200).json(data);
    // return;

    if (req.method === "POST") {
        console.log("---------Start ig webhook-----------")
        console.log(JSON.stringify(req.body));
        console.log("---------Endtry data------")
        console.log(JSON.stringify(req.body.entry));
        console.log("---------changes data---------");
        console.log(JSON.stringify(req.body.entry[0].changes))
        console.log("---------End ig webhook-----------")
        saveComments(req.body.entry);
    } else {
        console.log("------Query End--------");
        console.log(req.query);
        console.log("------Query End--------");
        const VERIFY_TOKEN = "token_for_instagram";
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

const saveComments = async (entry: any) => {
    for (let k = 0; k < entry.length; k++) {
        const changes = entry[k].changes;
        const page_id = entry[k].id;
        const create_time = convertDateForDB(entry[k].time * 1000);
        const source_data = await getSource(page_id);
        if (!source_data) {
            continue;
        }
        for (let j = 0; j < changes.length; j++) {
            const value = changes[j].value;
            let comment_id = value.id;
            let parent_id = value.parent_id;
            const message = value.text;
            const from_id = value.from.id;
            const from_name = value.from.username;
            const post_id = value.media.id;
            const brand_id = source_data.brand_id;
            const page_name = source_data.page_name;
            const access_token = source_data.access_token;

            if (from_id == page_id) {
                continue;
            }
            
            console.log("--------------Messsage--------------");
            console.log(message);
            const post_data: any = await getPostData(post_id, access_token);
            const post_caption = post_data.message;
            const attachments = post_data.attachments;
            const permalink_url = post_data.permalink_url;
            
            console.log("------------Post caption-------------");
            console.log(post_caption);
            console.log("-----------Access Token-------------");
            console.log(access_token);
            console.log("--------Comments---------")

            let parent_comment: any = [];
            let _comment_history: any = [];
            if(parent_id && parent_id !="") {
                const comments = await getCommentHistory(parent_id, access_token);
                parent_comment = comments?.parent_comment;
                _comment_history = comments?.comment_history;
            }

            const comment_history: any = [];
            _comment_history.map((item:any) => {
                if(item.message != message) {
                    comment_history.push(item);
                }
            })

            console.log("------- Parent_comment-------------")
            console.log(parent_comment);
            
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
                    "I'm not sure the suggestion",
                    "I'm not sure the suggestion",
                    "I'm not sure the suggestion",
                ]
                try {
                    const content = suggestions[0].message.content;
                    console.log("---------------Content Response---------")
                    console.log(content);
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
                        picture: '',
                        attachments,
                        type: "ig"
                    }]);
                    console.log("-------------Saved Result----------------");
                    console.log(saved);
                    if (status == "automatic") {
                        await postSuggestion(comment_id, parsed_content[0], access_token)
                    }
                }
            }
        }
    }
}

const postSuggestion = async (comment_id: string, suggestion: string, access_token: string) => {
    if (!access_token) {
        return;
    }
    if (suggestion == "LIKE") {
        // await axios.post(
        //   `https://graph.facebook.com/${comment_id}/likes?access_token=${access_token}`
        // );
    } else if (suggestion == "HIDE") {
        await axios.post(
            `https://graph.facebook.com/v18.0/${comment_id}?access_token=${access_token}&hide=true`
        );
    } else {
        await axios.post(
            `https://graph.facebook.com/v18.0/${comment_id}/replies?access_token=${access_token}&message=${suggestion}`,
            {
                message: suggestion,
            }
        );
    }
    handleSuggestion(comment_id, '0', suggestion, 'ig');
}

const getStatus = async (brand_id: string) => {
    const { data, error } = await supabaseAdmin.from("cron_status").select("*").eq("brand_id", brand_id);
    let status = "";
    if (data && data.length > 0) {
        status = data[0]['status']
    }
    return status;
}

const getSource = async (page_id: string) => {
    const { error, data } = await supabaseAdmin.from("sources").select("*").eq("page_id", page_id).eq("connected", true);
    if (data && data.length) {
        return data[0];
    } else {
        return false;
    }
}

const getPostData = async (post_id: string, access_token: string) => {
    const url = `https://graph.facebook.com/v18.0/${post_id}?access_token=${access_token}&fields=caption,comments_count,id,ig_id,is_comment_enabled,is_shared_to_feed,like_count,media_product_type,media_type,media_url,owner,permalink,shortcode,thumbnail_url,timestamp,username,children,comments`;
    const res = await fetch(url);
    if (res.ok) {
        const data = await res.json();
        const caption = data.caption;
        const permalink_url = data.permalink;
        let attachments: any = {};
        if (data.media_type == "IMAGE") {
            attachments = {
                media_type: 'photo',
                media: {
                    image: {
                        src: data.media_url
                    }
                }
            }
        } else if (data.media_type == "VIDEO") {
            attachments = {
                media_type: 'video',
                media: {
                    source: data.media_url
                }
            }
        }
        return {
            message: caption,
            attachments,
            permalink_url
        };
    } else {
        return '';
    }
}

const getCommentHistory = async (comment_id: string, access_token: string) => {
    try {
        const url = `https://graph.facebook.com/v18.0/${comment_id}?access_token=${access_token}&fields=from,hidden,id,like_count,media,parent_id,text,timestamp,username,user,replies{from,id,timestamp,text,username,like_count}`;
        const res = await fetch(url);
        console.log(url);
        if (res.ok) {
            const data = await res.json();
            let replies = [];
            try{
                replies = data.replies.data;
            }catch(e){
                
            }
            let comment_history = [];
            let parent_comment = {
                message: data.text,
                created_time: data.timestamp,
                from: {
                    id: data.from.id,
                    name: data.from.username
                }
            };
            for (let k = 0; k < replies.length; k++) {
                comment_history.push({
                    from: {
                        id: replies[k].from['id'],
                        name: replies[k].from['username']
                    },
                    message: replies[k].text,
                    created_time: replies[k].timestamp
                })
            }
            return {
                comment_history,
                parent_comment
            };
        } else {
            return {
                comment_history:[],
                parent_comment:null
            };
        }
    } catch (e) {
        console.log(e)
    }
}