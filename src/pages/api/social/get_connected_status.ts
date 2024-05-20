import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    const brand_id =  req.body.brand_id;
    const {error, data} = await supabaseAdmin.from("sources").select("type, connected").eq("brand_id", brand_id);
    if(data){
        res.status(200).json(data);
    } else {
        console.log(error);
        res.status(201).json([]);
    }
}