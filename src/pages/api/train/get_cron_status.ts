
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const brand_id = req.body.brand_id;
    const { error, data} = await supabaseAdmin.from("cron_status").select("*").eq("brand_id", brand_id);
    if(error) {
        res.status(202).json({});
    } else if(data.length == 0){
        const cront_insert = await supabaseAdmin.from('cron_status').insert([
            {
                brand_id
            }                    
        ])
        console.log(cront_insert.error);
        res.status(200).json({status: 'manually'});
    } else{
        res.status(200).json({status: data[0].status});
    }
}