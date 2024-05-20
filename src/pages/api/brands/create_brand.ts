// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Brands } from '@/types/brands';
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Brands[] | null>
) {
    try {
        
        const name = req.body.name;
        const description = req.body.description;
        const user_id = req.body.user_id;
        
        try{
            const { error, data } = await supabaseAdmin.from('brands')
                                    .insert([{
                                        name: name,
                                        description: description,
                                        user_id: user_id
                                    }]).select("*").limit(1);
            if(error){
                res.status(429).json([])
            } else{
                const cront_insert = await supabaseAdmin.from('cron_status').insert([
                    {
                        brand_id: data[0].id
                    }                    
                ])
                console.log(cront_insert.error);
                res.status(200).json([])
            }
        }catch(e){
            res.status(429).json([])
        }

    }catch(e){
        res.status(429).json([])
    }
    
}
