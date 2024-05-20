// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const page_index = req.body.page_index;
  const brand_id = req.body.brand_id;
  try {
    let trained_files: any = [];
    // const { data, error } = await supabaseAdmin.from('files').select('*').range(0, 10);
    const { data: sources, error } = await supabaseAdmin.from('sources')
      .select('id').eq('brand_id', brand_id);


    if (sources) {
      const all_files: any=[];
      for (let k = 0; k < sources?.length; k++) {
        const source_item: any = sources[k];
        let { data: files, error } = await supabaseAdmin.from('files')
          .select('created_at, url, type ').eq('source_id', sources[k].id);


        files?.map((item: any) => {
          let exist = false;
          all_files.map((file: any) => {
            if((file.url == item.url) && file.type =='websites'){
              exist = true;
            }
          })
          if(!exist){
            item['path'] = source_item.path;
            all_files.push(item);
          }
        })
      
        trained_files = recordRange(page_index * 10, page_index * 10 + 10, all_files);
      }
    }
    res.status(200).json({ data: trained_files });
  } catch (e) {
    res.status(220).json({ data: [] });
  }
}

function recordRange(start: number, end: number, data: any) {
  const rangeArray = [];
  for (let i = start; i < end; i++) {
    if((i+1) >= data.length) {
        break;
    }
    rangeArray.push(data[i]);
  }
  return rangeArray;
}