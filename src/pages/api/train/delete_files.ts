import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const source_id = parseInt(req.body.source_id);
    try{
        const { error } = await supabaseAdmin.from('files')
            .delete().eq('source_id', source_id).eq('type', 'websites');
        
        if(error){
            res.status(201).json({msg: error});    
        } else{
            res.status(200).json({msg: "success"});    
        }
    }catch(e){
        console.log(e);
        res.status(202).json({msg: "error"});    

    }
}
