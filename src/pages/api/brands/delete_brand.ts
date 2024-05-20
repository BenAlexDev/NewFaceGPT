// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase, supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const brand_ids = req.body.brand_ids;
    const promises: Promise<any>[] = [];
    for (let k = 0; k < brand_ids.length; k++) {
        promises.push(deleteBrand(brand_ids[k]));
    }
    await Promise.all(promises);
    res.status(200).json({})
}

const deleteBrand = async (brand_id: string) => {
    await unsubscribeToken(brand_id);
    await supabaseAdmin.from("brands").delete().eq("id", brand_id);
    await supabaseAdmin.from("sources").delete().eq("brand_id", brand_id);
    await supabaseAdmin.from("files").delete().eq("brandid", brand_id);
    await supabaseAdmin.from("fb_files").delete().eq("brand_id", brand_id);
    await supabaseAdmin.from("webhook").delete().eq("brand_id", brand_id);
    await supabaseAdmin.from("cron_status").delete().eq("brand_id", brand_id);
}

const unsubscribeToken = async (brand_id: string) => {
    try {
        const { error, data } = await supabaseAdmin.from("sources").select("*").eq("brand_id", brand_id).eq("type", "fb");
        if (data && data.length > 0) {
            const access_token = data[0]['access_token'];
            const page_id = data[0]['page_id'];
            await axios.delete(
                `https://graph.facebook.com/${page_id}/subscribed_apps?access_token=${access_token}                                  `
            );
        }
    } catch (e) {
        console.log(e);
    }

}