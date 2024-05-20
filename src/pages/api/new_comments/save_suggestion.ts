import { createEmbedding } from '@/utils/server/generate-embeddings';
import { convertAndSave } from '@/utils/server/generate-suggestions';
import { supabase, supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const brand_id = req.body.brand_id;
    const comment_id = req.body.comment_id;
    const suggestion_id = req.body.suggestion_id;
    const suggestion = req.body.suggestion;
    const type = req.body.type;
    const index = req.body.index;

    const result = await handleSuggestion(comment_id, suggestion_id, suggestion, type);
    if(result){
        res.status(200).json({
            msg: 'success'
        })
    } else {
        res.status(201).json({
            msg: 'failed'
        })
    }
}

export const handleSuggestion = async(comment_id: string, suggestion_id: string, suggestion: string, type: string) => {
    const updated_comment = await supabaseAdmin.from('webhook').update([{
        posted: suggestion_id
    }]).eq('comment_id', comment_id);
    
    if(!updated_comment.error) {
        const {data} = await supabaseAdmin.from('webhook').select("*").eq("comment_id", comment_id);
        if(data && data.length > 0 ) {
            if(!await existComment(comment_id)) {
                const suggestions = data[0].suggestions;
                suggestions[Number(suggestion_id)] = suggestion;
                console.log("---------Suggestions-----------");
                console.log(suggestions);
                await supabaseAdmin.from('webhook').update([{suggestions: suggestions}]).eq("id", data[0].id);
                await saveSuggestion(data[0], suggestion, type)
            }
        }
        return true;
    } else {
        return false;
    }
}

const existComment = async(comment_id: string) => {
    const { data} = await supabaseAdmin.from("fb_files").select("*").eq("comment_id", comment_id);
    if(data && data.length > 0) {
        return true;
    } else {
        return false;
    }
}

const saveSuggestion = async(comment_data:any, suggestion: string, type: string) => {
    const suggestions = comment_data.suggestions;
    let is_like = "No";
    let is_hidden = "No";

    // suggestions.map((item: string) => {
    //     if(item == "LIKE") {
    //         is_like = "Yes";
    //     }
    //     if(item == "HIDE") {
    //         is_hidden = "Yes";
    //     }
    // });
    if(suggestion == "LIKE"){
        is_like="Yes";
    }

    if(suggestion == "HIDE"){
        is_hidden="Yes"
    }
    
    const parent_comments = comment_data.comment_history;
    let sub_comments:any = [];
    
    if((is_like == "Yes" || is_hidden == "Yes") || type =='ig') {
        sub_comments = [{
            created_time: comment_data.create_time,
            from: { 
                id: comment_data.page_name,
                name:comment_data.page_id
            },
            message: suggestion
        }];
    }
    
    const post_caption = comment_data.post_caption;
    const comment_id = comment_data.comment_id;
    const brand_id = comment_data.brand_id;
    const page_id = comment_data.page_id;
    const source_id = -1;

    const comment = comment_data.message;
    const sub_comments_embedded = await createEmbedding(JSON.stringify(sub_comments));
    const comment_embedded = await createEmbedding(comment);
    const comment_date = comment_data.create_time;
    const name = comment_data.from_name;
    
    const data = {
        name,
        comment,
        is_hidden,
        is_like,
        comment_date,
        post_caption,
        comment_id,
        sub_comments,
        sub_embedded: sub_comments_embedded.embedding.data[0].embedding,
        comment_embedded: comment_embedded.embedding.data[0].embedding,
        tokens: sub_comments_embedded.embedding.usage.total_tokens ?? 0 + comment_embedded.embedding.usage.total_tokens ?? 0 + 50,
        parent_comments,
        source_id,
        brand_id,
        page_id,
        type
    };

    const { error } = await supabaseAdmin.from("fb_files").insert([data]);
}
