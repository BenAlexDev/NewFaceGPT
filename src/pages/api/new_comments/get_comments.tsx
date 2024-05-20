// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const brand_id = req.body.brand_id;
    const {error, data} = await supabaseAdmin.from("webhook").select("*").eq("brand_id", brand_id);
    if(error) {
        res.status(200).json([]);
    } else {
        res.status(200).json(data);
    }
}