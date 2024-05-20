import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import axios from 'axios';
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.body.id;
    const brand_id = req.body.brand_id;
    const type = req.body.type;

    try {
        await unsubscribeToken(id, brand_id);
        if (type == "ig") {
            await supabaseAdmin.from('sources').update({
                connected: false
            }).eq('brand_id', brand_id).eq('type', 'ig');
            res.status(200).json({ msg: "success" });
        } else {
            const { error } = await supabaseAdmin.from('sources').delete().eq('id', id);
            if (error) {
                res.status(201).json({ msg: error });
            } else {
                await supabaseAdmin.from('files').delete().eq('source_id', id);
                await supabaseAdmin.from('fb_files').delete().eq('source_id', id);
                res.status(200).json({ msg: "success" });
            }
        }

    } catch (e) {
        res.status(202).json({ msg: "error" });
        console.log(e);
    }
}

const unsubscribeToken = async (source_id: string, brand_id: string) => {
    const { error, data } = await supabaseAdmin.from("sources").select("*").eq("id", source_id).eq("type", "fb");
    if (data && data.length > 0) {
        await supabaseAdmin.from("brands").update({
            image: ''
        }).eq("id", brand_id)
        await supabaseAdmin.from("sources").delete().eq("brand_id", brand_id).eq("type,", "ig");
        const page_id = data[0]['page_id'];
        const access_token = data[0]['access_token'];
        await axios.delete(
            `https://graph.facebook.com/${page_id}/subscribed_apps?access_token=${access_token}                                  `
        );
    }
}
