// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
import { comment } from 'postcss';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const comment_id = req.body.comment_id;
    const comment_data: any = await supabaseAdmin.from("webhook").select("*").eq("comment_id", comment_id);
    console.log(comment_data);
    if(comment_data.data && comment_data.data.length > 0) {
        const source_data: any = await supabaseAdmin.from("sources").select("*").eq("brand_id", comment_data.data[0].brand_id).neq("access_token", null);
        if(source_data.data && source_data.data.length > 0) {
            res.status(200).json({
                access_token: source_data.data[0].access_token
            });
        } else {
            console.log(source_data);
            res.status(202).json({
                "msg":"Can't find the matched Access Token."
            })
        }
    } else {
        res.status(201).json({
            'msg': `Can't find the matched Access Token.`
        })
    }
}
