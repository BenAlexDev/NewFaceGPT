import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
    const user_id =  req.body.user_id;
    const { error, data } = await supabaseAdmin.from("users").update({
        fb_long_lived_access_token: ''
    }).eq("id", user_id);
    if(data){
      res.status(200).json({msg: 'success'})
    } else {
      console.log(error)
      res.status(201).json({msg: "error"})
    }
}