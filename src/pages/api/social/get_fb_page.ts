import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const page_name =  req.body.page_name;
    const { error, data } = await supabaseAdmin.from("sources").select("*")
    .eq("page_name", page_name)
    .eq("type", 'fb')
    if(data){
      res.status(200).json(data)
    } else {
      console.log(error);
      res.status(201).json({msg: "error"})
    }
}

