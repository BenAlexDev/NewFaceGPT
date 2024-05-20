
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const brand_id = req.body.brand_id;
    const status = req.body.status;
    const {error, data} = await supabaseAdmin.from('cron_status').update([{
        status
    }]).eq("brand_id", brand_id);
    if(error){
        res.status(202).json({});
    } else {
        res.status(200).json({});
    }
}