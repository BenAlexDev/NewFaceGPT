
import { DEFAULT_PROMPT_TEMPLATE, I_DONT_KNOW, OPENAI_MODELID, SPLIT_TEXT_LENGTH, SYSTEM_PROMPT } from '@/utils/server/consts'
import { createEmbedding } from '@/utils/server/generate-embeddings'
import { supabase, supabaseAdmin } from '@/utils/server/supabase-admin'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi, ResponseTypes } from 'openai-edge'
const config_openai = new Configuration({
    apiKey: process.env.OPENAI_API_KEY_4
})
const openai = new OpenAIApi(config_openai)

if (!process.env.OPENAI_API_KEY)
    console.warn(
        'OPENAI_API_KEY has not been provided in this deployment environment. ' +
        'Will use the optional keys incoming from the client, which is not recommended.',
    );


const types = [
    { name: 'fb', count: 5 },
    // {name: 'comment_history', count: 3},
    { name: 'websites', count: 3 },
    { name: 'answers', count: 2 },
    { name: 'file', count: 1 },
];


export const getSuggestionsFromGPT = async (options: any, brand_id: string, query: string) => {

    console.log("--------------Opetions End----------")
    if (Object.keys(options).includes("include_comments")) {
        await saveFbCommentHistory(options.comment_history, options.post_caption, brand_id);
    }
    
    const page_id = await getPageId(brand_id);
    const embedding_data = await createEmbedding(query);
    const brand_name = await getBrandname(brand_id);

    let matched_cnt = 0;
    let matched_comment_history: any = [];
    let matched_websites: any = [];
    let matched_fb: any = [];

    for (let k = 0; k < types.length; k++) {
        try {
            if (types[k].name == 'fb') {
                const matched = await supabaseAdmin.rpc("fb_matched_sections", {
                    embedding: embedding_data.embedding.data[0].embedding,
                    match_threshold: 0.5,
                    match_count: types[k].count,
                    trained_type: types[k].name,
                    brandid: brand_id
                });
                console.log(matched);
                matched_fb = matched.data;
            } else if (types[k].name == 'comment_history') {
                const matched = await supabaseAdmin.rpc("fb_history_matched_sections", {
                    embedding: embedding_data.embedding.data[0].embedding,
                    match_threshold: 0.5,
                    match_count: types[k].count,
                    trained_type: types[k].name,
                    brandid: brand_id
                });
                matched_comment_history = matched.data;
            } else if (types[k].name == "websites") {
                const matched = await supabaseAdmin.rpc("matched_sections", {
                    embedding: embedding_data.embedding.data[0].embedding,
                    match_threshold: 0.5,
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

    if ( (matched_websites&&matched_websites.length == 0) &&
        matched_comment_history.length == 0 &&
        matched_fb.length == 0) {
        matched_cnt = 0;
    } else {
        matched_cnt = 1;
    }

    let full_prompt = DEFAULT_PROMPT_TEMPLATE
        .replace('{{I_DONT_KNOW}}', I_DONT_KNOW)
        .replace('{{CONTEXT_FB}}', JSON.stringify(matched_fb))
        .replace('{{PAGE_ID}}', page_id)
        .replace('{{PROMPT_CAPTION}}', options.post_caption)
        .replace('{{CONTEXT_WEB}}', JSON.stringify(matched_websites))
        .replace('{{PROMPT_PARENT}}', options.parent_comment)
        .replace('[COMPANY NAME]', brand_name)
        .replace('{{PROMPT}}', query)

    if (matched_cnt == 0) {
        full_prompt = `Pleae answer only "I'm not sure. I can't your answers from trained data. "`;
    }
    
    console.log('----------Context Start-------------');
    console.log(full_prompt);
    console.log('----------Context End-------------');

    let messages: any = [
        {
            role: 'user',
            content: full_prompt
        },
        {
            role: 'system',
            content: SYSTEM_PROMPT
        },
    ];

    const response = await openai.createChatCompletion({
        model: OPENAI_MODELID,
        stream: false,
        temperature: 0.5,
        messages
    });

    const data = (await response.json()) as ResponseTypes["createCompletion"]
    
    const result = {
        suggestions: data.choices,
        prompt: full_prompt
    };

    return result;
    
    // Convert the response into a friendly text-stream 
    // const stream = OpenAIStream(response, {
    //     async onCompletion(completion) {
    //         if(options.store_answers){
    //             trainResponse(brand_id, completion);
    //         }
    //     }
    // })
    // return new StreamingTextResponse(stream)

}

const getSourceId = async (brand_id: string) => {
    let source_id: number = -1;
    const { error, data: source_data } = await supabaseAdmin.from('sources').select("*").eq('brand_id', brand_id).eq('type', 'answers');
    if (source_data && source_data.length > 0) {
        source_id = source_data[0].id;
    } else {
        const { error: source_error, data: insert_data } = await supabaseAdmin.from('sources').insert([{
            brand_id: brand_id,
            path: 'answers',
            type: 'answers'
        }]).select("*").limit(1);
        if (insert_data && insert_data.length > 0) {
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
    
}
export async function convertAndSave(txt: string, source_id: number, brandid: string) {

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

const splitText = (text: string) => {
    const split_arr: string[] = [];
    for (let k = 0; k < text.length; k += SPLIT_TEXT_LENGTH) {
        split_arr.push(
            'Answers Start:' + text.slice(
                k,
                SPLIT_TEXT_LENGTH + k
            ) + ' Answers End'
        )
    }
    return split_arr;
}

const getPageId = async (brand_id: string) => {
    const { error, data } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id);
    if (!error) {
        return data[0].page_id
    }
}

const saveFbCommentHistory = (post_caption: string, comment_history_string: string, brand_id: string) => {
    try {
        const comment_history = JSON.parse(comment_history_string);

    } catch (e: any) {
        console.log(e);
    }
}

const getBrandname = async (brand_id: string): Promise<any>=> {
    const brands = await supabaseAdmin.from("brands").select("*").eq("id", brand_id);
    if (brands.data && brands.data.length > 0) {
        return brands.data[0].name;
    } else {
        return '';
    }
}
