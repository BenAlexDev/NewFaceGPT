import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import { Source } from '@/types/train';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Source[]>
) {
    const brand_id = req.body.brand_id;
    try{
        const { data,error } = await supabaseAdmin.from('sources').select("*").eq("brand_id", brand_id);
        if(!error){
            for(let k=0; k<data.length;k++){
                data[k]['trained'] = await chkTrained(data[k].id);
            }
            res.status(200).json(data);
        } else{
            res.status(201).json([]);
        }
    }catch(e){
        res.status(202).json([]);
    }
}

const chkTrained = async(source_id: string) => {
    const { error, data} = await supabaseAdmin.from('files').select("*").eq('source_id', source_id).limit(1);
    if(data){
        if(data.length >0) {
            return true;
        }
    }
    return false;
}
