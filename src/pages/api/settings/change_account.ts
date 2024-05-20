import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.body.params;
  const user_id =  req.body.user_id;
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { email: params.email, password: params.password });
  
  if (!error) {
    const { error, data } = await supabaseAdmin.from('users')
      .update([{
        email: params.email,
        full_name: params.name,
        avatar_url: params.avatar
      }]).eq("id", user_id);
    console.log(error);
    if(!error){
      const user_data = await supabaseAdmin.from('users').select("full_name, avatar_url, email").eq("id", user_id);
      if(user_data.data) {
        res.status(200).json(user_data.data[0]);
      } else {
        res.status(203).json(data);
      }
    } else {
      res.status(202).json({});
    }
  } else {
    res.status(201).json({});
  }
}

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '20mb' // Set desired value here
      }
  }
}
