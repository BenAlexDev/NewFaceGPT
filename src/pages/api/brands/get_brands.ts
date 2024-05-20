// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Brands } from '@/types/brands';
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Brands[] | null>
) {
    
    const user_id = req.body.user_id;
    try {
        const { error, data } = await supabaseAdmin.from('brands').select("*").eq('user_id', user_id);
        if(error){
            res.status(429).json([])
        } else {
            res.status(200).json(data);
        }    
    }catch(e){
        res.status(429).json([])
    }
}
