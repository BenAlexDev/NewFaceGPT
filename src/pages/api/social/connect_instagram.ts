import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    const brand_id =  req.body.brand_id;
    const { error, data } = await supabaseAdmin.from("sources").update({
        connected: true
    }).eq("brand_id", brand_id)
    .eq("type", "ig");

    if(!error){
      res.status(200).json({msg: 'success'})
    } else {
      res.status(201).json({msg: "error"})
    }
}