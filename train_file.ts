import { supabase, supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'
import { createEmbedding } from '@/utils/server/generate-embeddings';
import { SPLIT_TEXT_LENGTH } from '@/utils/server/consts';


const fbCommentIds: string[] = [];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    let text = req.body.text;
    let url = req.body.url;
    let type = req.body.type;
    let brand_id = req.body.brand_id;
    let page_name = req.body.page_name;
    let source_id = req.body.souce_id;

    let splited_text_arr: any = [];
    if (type == "fb") {
        await getCommentIds(brand_id);
        try{
            const page_id = url;
            splited_text_arr = await splitFBJSon(text, page_id, page_name, source_id, brand_id);
        }catch(e) {
            console.log(e);
        }
    } else {
        splited_text_arr = splitText(text, url, type);
    }

    let error_status = false;

    if (type == 'fb') {

        const del_files = await supabaseAdmin.from('fb_files').delete().eq('brand_id', brand_id.toString());
        let index = 0;
        for (let k = 0; k < splited_text_arr.length; k += 20) {
            const promises: any = [];
            if(index > 500) {
                break;
            }
            for (let j = k; j < k + 20; j++) {
                if (j >= splited_text_arr.length) {
                    break;
                }
                if (splited_text_arr[j]) {
                    index++;
                    if(index > 500) {
                        break;
                    }
                    promises.push(saveFbData(splited_text_arr[j]));
                }
            }
            const result = await Promise.all(promises);
        }
    } else {
        let promises: Promise<any>[] = [];
        for (let k = 0; k < splited_text_arr.length; k++) {
            promises.push(convertAndSave(splited_text_arr[k]))
        }
        const promise_res = await Promise.all(promises);
    }

    if (error_status) {
        res.status(201).json({ msg: 'error' })
    } else {
        res.status(200).json({ msg: 'success' })
    }


    async function convertAndSave(txt: string) {

        const embedded = await createEmbedding(txt);
        const { error } = await supabaseAdmin.from('files').insert([{
            embedded: embedded.embedding.data[0].embedding,
            content: embedded.content,
            tokens: embedded.embedding.usage.total_tokens ?? 0,
            source_id: source_id,
            url: url,
            type: type,
            created_at: new Date(),
            brandid: brand_id
        }])
        if (error) {
            error_status = true;
        }
    }
}

const saveFbData = async (item: any) => {
    if (item) {
        const { error } = await supabaseAdmin.from('fb_files').insert(item);
        console.log(error);
    }
}

const splitText = (
    text: string,
    url: string,
    type: string

) => {
    const split_arr: string[] = [];
    let prefix = '';
    if (type == 'websites') {
        prefix = '';
    } else if (type == 'fb') {
        prefix = '';
    } else if (type == 'file') {
        prefix = '';
    }
    
    for (let k = 0; k < text.length; k += SPLIT_TEXT_LENGTH) {
        split_arr.push(
            `` + text.slice(
                k,
                SPLIT_TEXT_LENGTH + k
            )
        )
    }

    return split_arr;
}

const splitFBJSon = async (fb_json: any, page_id: string, page_name: string, source_id: string, brand_id: string) => {
    const promises: any = [];

    for (let k = 0; k < fb_json.length; k++) {
        promises.push(ConvertFBComment(fb_json[k], source_id, brand_id, page_id, page_name));
    }
    
    let data: any = [];
    data = await Promise.all(promises);
    const _data: any = [];

    for (let k = 0; k < data.length; k++) {
        let group: any = [];
        for (let j = 0; j < data[k].length; j++) {
            if (data[k][j]) {
                if (fbCommentIds.filter((comment_id) => comment_id == data[k][j].comment_id).length == 0) {
                    group.push(data[k][j]);
                    fbCommentIds.push(data[k][j].comment_id);
                }
            }
        }
        _data.push(group);
    }
    return _data;
}

const getFBItem = async (item: any, post_caption: any, source_id: string, brand_id: string, page_id: string, page_name: string) => {
    
    console.log(item);

    const sub_comments = item.comments.data;
    const comment = item.message;
    const name = item.from.name;
    const is_hidden = item.is_hidden ? 'Yes' : 'No';
    const comment_date = item.created_time;
    const comment_id = item.id;
    let is_like = 'No';
    
    if (Object.keys(item).includes('likes')) {
           for (let k = 0; k < item.likes.data.length; k++) {
            if (item.likes.data[k].name == page_name) {
                is_like = "Yes";
            }
        }
    }
    
    let data: any = false;
    if (is_like == "Yes" || is_hidden == "Yes") {
        const filter_sub_comments: any = [];
        sub_comments.map((item: any) => {
            if (item.from.name == page_name && item.from.id == page_id) {
                filter_sub_comments.push(item);
            }
        })
        const sub_comments_embedded = await createEmbedding(JSON.stringify(filter_sub_comments));
        const comment_embedded = await createEmbedding(comment);

        data = {
            name,
            comment,
            is_hidden,
            is_like,
            comment_date,
            post_caption,
            comment_id,
            sub_comments: filter_sub_comments,
            sub_embedded: sub_comments_embedded.embedding.data[0].embedding,
            comment_embedded: comment_embedded.embedding.data[0].embedding,
            tokens: sub_comments_embedded.embedding.usage.total_tokens ?? 0 + comment_embedded.embedding.usage.total_tokens ?? 0 + 50,
            parent_comments: {},
            source_id,
            brand_id,
            page_id
        };
    }
    
    console.log("-----------Item--------------");
    return data;

}

const ConvertFBComment = async (item: any, source_id: string, brand_id: string, page_id: string, page_name:string) => {

    let data: any = false;

    try {
        if (!Object.keys(item).includes("comments")) {
            return data;
        }
        
        const content = item.comments.data;
        const promises: any = [];
        let post_caption = '';


        if (Object.keys(item).includes('message')) {
            post_caption = item.message;
        }

        // if (Object.keys(item).includes('id')) {
        //     page_id = item.id;
        // }
        
        
        for (let k = 0; k < content.length; k++) {
            promises.push(
                getFBItem(content[k], post_caption, source_id, brand_id, page_id, page_name)
            )
        }
        data = await Promise.all(promises);
    } catch (e) {
        console.log(e);
    }
    return data;
}

const getCommentIds = async (brand_id: string) => {
    const commentIds: string[] = [];
    const { error, data } = await supabaseAdmin.from('fb_files').select('comment_id').eq("brand_id", brand_id);
    if (!error) {
        data.map((item) => {
            fbCommentIds.push(item.comment_id);
        })
    }
}


const getSourceId = async(brand_id: string, source_nmae: string) => {
    const res =  await supabaseAdmin.from('fb_souces').insert([
        {
            brand_id,
            source_nmae
        }
    ]).select("*").limit(1);
    if(res.data){
        return   res.data[0].id;
    }
}


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb' // Set desired value here
        }
    }
}