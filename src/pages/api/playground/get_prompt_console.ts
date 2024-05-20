import { DEFAULT_PROMPT_TEMPLATE, I_DONT_KNOW, SPLIT_TEXT_LENGTH } from '@/utils/server/consts'
import { createEmbedding } from '@/utils/server/generate-embeddings'
import {  supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'


type MatchedSection = {
    content: string,
    url: string,
    tokens: number
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const types = [
        {name: 'fb', count: 5},
        {name: 'websites', count: 3},
        {name: 'answers', count: 2},
        {name: 'file', count: 1},
    ];
    
    const params =  req.body;
    const brand_id = params.brand_id;
    const query = params.query;
        
    const options:{
        comment_history: string,
        current_comment: string,
        store_answers: boolean,
        post_caption: string
        include_comments: boolean
    } = params.options;

    if(options.include_comments){
       await saveFbCommentHistory(options.comment_history, options.post_caption, brand_id);
    } 

    const page_id = await getPageId(brand_id);
    const embedding_data = await createEmbedding(query);
    const brand_name = await getBrandname(brand_id);
    
    
    let matched_cnt = 0;
    let matched_comment_history: any=[];
    let matched_websites: any = [];
    let matched_fb: any = [];
    
    for(let k=0; k<types.length; k++){
        try {
            if(types[k].name == 'fb') {
                const matched = await supabaseAdmin.rpc("fb_matched_sections", {
                    embedding: embedding_data.embedding.data[0].embedding,
                    match_threshold: 0.67,
                    match_count: types[k].count,
                    trained_type: types[k].name,
                    brandid: brand_id
                });
                matched_fb = matched.data;
            } else if(types[k].name == 'comment_history'){
                const matched = await supabaseAdmin.rpc("fb_history_matched_sections", {
                    embedding: embedding_data.embedding.data[0].embedding,
                    match_threshold: 0.67,
                    match_count: types[k].count,
                    trained_type: types[k].name,
                    brandid: brand_id
                });
                matched_comment_history = matched.data;
            } else if(types[k].name == "websites") {
                const matched = await supabaseAdmin.rpc("matched_sections", {
                    embedding: embedding_data.embedding.data[0].embedding,
                    match_threshold: 0.67,
                    match_count: types[k].count,
                    trained_type: types[k].name,
                    files_brand_id: brand_id
                });
                matched_websites = matched.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    if(matched_websites.length == 0 && 
        matched_comment_history.length == 0 && 
        matched_fb.length == 0){
        matched_cnt=0;
    } else {
        matched_cnt=1;
    }

    let full_prompt = DEFAULT_PROMPT_TEMPLATE
        .replace('{{I_DONT_KNOW}}', I_DONT_KNOW)
        .replace('{{CONTEXT_FB}}', JSON.stringify(matched_fb))
        .replace('{{PAGE_ID}}', page_id)
        .replace('{{PROMPT_CAPTION}}', options.post_caption)
        .replace('{{PROMPT_PARENT}}', JSON.stringify(options.comment_history))
        .replace('{{CONTEXT_WEB}}', JSON.stringify(matched_websites))
        .replace('[COMPANY NAME]', brand_name)
        .replace('{{PROMPT}}', query)
    
    if(matched_cnt == 0) {
        full_prompt = `Pleae answer only "I'm not sure. I can't your answers from trained data. "`;
    }

    console.log('----------Context Start-------------');
    console.log(full_prompt);
    console.log('----------Context End-------------');

    res.status(200).json({
        prompt: full_prompt
    })
}

const getSourceId = async(brand_id: string) => {
    let source_id:number = -1;
    const { error, data: source_data } = await supabaseAdmin.from('sources').select("*").eq('brand_id', brand_id).eq('type', 'answers');
    if(source_data && source_data.length > 0) {
        source_id = source_data[0].id;
    } else {
        const { error: source_error, data: insert_data } = await supabaseAdmin.from('sources').insert([{
            brand_id: brand_id,
            path: 'answers',
            type: 'answers'
        }]).select("*").limit(1);
        if(insert_data && insert_data.length > 0) {
            source_id = insert_data[0].id;
        }
    }
    return source_id;
}

const trainResponse = async (brand_id: string, text: string) => {
        
    let source_id: number = await getSourceId(brand_id);
    if (source_id == -1) {
        const arr_txt = splitText(text);
        let promises: Promise<any>[] = [];

        for (let k = 0; k < arr_txt.length; k++) {
            promises.push(convertAndSave(arr_txt[k], source_id, brand_id))
        }
        await Promise.all(promises);

    }
    async function convertAndSave(txt: string, source_id: number, brandid: string) {

        const embedded = await createEmbedding(txt);
        const { error } = await supabaseAdmin.from('files').insert([{
            embedded: embedded.embedding.data[0].embedding,
            content: embedded.content,
            tokens: embedded.embedding.usage.total_tokens ?? 0,
            source_id: source_id,
            url: 'answers',
            type: 'answers',
            brandid,
            created_at: new Date()
        }])
        if (error) {
            console.log(error);
        }
    }
}

const splitText = (text: string) => {
    const split_arr: string[] = [];
    for (let k = 0; k < text.length; k += SPLIT_TEXT_LENGTH) {
        split_arr.push(
            'Answers Start:'+text.slice(
                k,
                SPLIT_TEXT_LENGTH + k
            )+' Answers End'
        )
    }
    return split_arr;
}


const getContextFromMatchedSections = async (matched_data: any) => {
    let context: string = '';
    let total_tokens = 0;
    matched_data.map((item: MatchedSection) => {
        if(item !=null){
            total_tokens += item.tokens;
            // if(total_tokens < 4096){
            context += JSON.stringify(item);
        }
        // }
    })
    // context = await convertLanguageByGpt(context);
    return context;
}

const convertLanguageByGpt = async (context: string) => {
    let messages: any = [
        {
            role: 'user',
            content: `You are a helpful assistant that translates.
            The text is like this:
            ${context}
            Please translate the following text to language used mostly in the contents of the provided text.
            Respond only with bullets with no pre-amble`
        }
    ];

    context = await getMessageFromOpenAI(messages);
    return context;

}

const getMessageFromOpenAI = async (messages: any) => {
    console.log("--------- OpenAI Start -------------")
    const response = await chatCompletions({
        token: process.env.OPENAI_API_KEY,
        body: {
            model: 'gpt-3.5-turbo',
            messages
        }
    })
    const data = await response.json();
    let res_text = '';
    if (data.error) {
        res_text = data.error.message;
    } else {
        res_text = data.choices[0].message.content;
    }
    return res_text;
}

const chatCompletions = async ({ token, body }: any) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    return response;
}

const getPageId = async(brand_id: string) => {
    const { error, data} = await supabaseAdmin.from('brands').select('*').eq('id', brand_id);
    if(!error) {
        return data[0].page_id
    }
}


const getBrandname = async(brand_id: string) => {
    const brands = await supabaseAdmin.from("brands").select("*").eq("id", brand_id);
    if(brands.data && brands.data.length > 0) {
        return brands.data[0].name;
    } else {
        return '';
    }
}


const saveFbCommentHistory = (post_caption: string, comment_history_string: string, brand_id: string) => {
    try{
        const comment_history = JSON.parse(comment_history_string);
        
    } catch(e: any){
        console.log(e);
    }
}
