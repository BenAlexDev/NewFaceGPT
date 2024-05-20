import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const params = req.body;
    try {
        if (params.type == "fb"
        ) {
            const exist = await supabaseAdmin.from('sources').select("*").
                eq('brand_id', params.brand_id).eq("type", "fb");
            if (exist.data) {
                if (exist.data.length > 0) {
                    res.status(201).json({ msg: 'You already created a page' });
                    return;
                }
            }
        }
        if(params.type == 'fb'){
            const ig_delete = await supabaseAdmin.from("sources")
            .delete()
            .eq("brand_id", params.brand_id)
            .eq("type", "ig");
        }
        
        const insert = await supabaseAdmin.from('sources')
            .insert([{
                type: params.type,
                brand_id: params.brand_id,
                path: params.path,
                access_token: params.access_token,
                page_id: params.page_id,
                page_name: params.path,
                file_size: params.file_size,
                connected: params.connected
            }]).select("*").order("id", { ascending: true })
        if (!insert.error) {
            res.status(200).json(insert.data[0]);
        } else {
            console.log(insert.error)
            res.status(201).json({ msg: 'connect error' });
        }
    } catch (e) {
        console.log(e);
    }
}
