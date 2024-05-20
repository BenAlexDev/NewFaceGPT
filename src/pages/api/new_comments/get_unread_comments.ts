// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const brand_id = req.body.brand_id;
    const limit_index = 10;
    const {error, data} = await supabaseAdmin.from("webhook").select("*")
        .eq("brand_id", brand_id)
        .eq('read', false)
        .order('create_time', {ascending:true});

    if(error) {
        res.status(200).json([]);
    } else {
        let _data = [];
        if(data.length <= 10) {
            _data = data;
        } else {
            for(let k=0; k<limit_index; k++){
                _data.push(data[k])
            }
        }
        res.status(200).json({
            total_count: data.length,
            data: _data
        });
    }
}