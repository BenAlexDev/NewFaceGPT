import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    const brand_id =  req.body.brand_id;
    const image = req.body.image;
    const { error, data } = await supabaseAdmin.from("brands").update({
        image: image
    }).eq("id", brand_id);
    if(data){
      res.status(200).json({msg: 'success'})
    } else {
      console.log(error)
      res.status(201).json({msg: "error"})
    }
}