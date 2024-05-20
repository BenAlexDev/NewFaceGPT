import { supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.body.id;
    const {error, data} = await supabaseAdmin.from('webhook').update([{
        read: true
    }]).eq("id", id);
    console.log(error);
    res.status(200).json({msg:'success'});
}