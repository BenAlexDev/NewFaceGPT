import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const user_id = req.body.user_id;
    const { error, data} = await supabaseAdmin.from("users").select("full_name, email, avatar_url").eq("id", user_id);
    if(data) {
        res.status(200).json(data[0]);
    } else {
        res.status(201).json({});
    }
}
