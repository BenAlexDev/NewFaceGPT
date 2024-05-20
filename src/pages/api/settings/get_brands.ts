import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const user_id = req.body.user_id;
    const {error, data: brand_data} = await supabaseAdmin.from('brands').select("*").eq("user_id", user_id);
    if(brand_data){
      for(let k=0; k<brand_data.length; k++){
        const { data: sources} = await supabaseAdmin.from('sources').select("*").eq("brand_id", brand_data[k].id);
        brand_data[k]['sources'] = sources;
        brand_data[k]['checked'] = false;
      }
    }
    res.status(200).json(brand_data);    
}
