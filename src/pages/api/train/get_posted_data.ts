
import { convertDateToYmd } from '@/utils/app/global';
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    type Status = {
        status: string
    }
    const brand_id = req.body.brand_id;
    const term = req.body.term;

    let offsetDate:any = new Date();
    let result:Status[] = [];
    if(term == "day") {
        offsetDate.setDate(offsetDate.getDate() - 5)
        const promises:Promise<any>[] = []
        for(let k=0; k<7; k++){
            let date:any = convertDateToYmd(offsetDate);
            date = date.toString().split("T")[0];
            offsetDate.setDate(offsetDate.getDate() + 1)
            promises.push(getData(date, 'day', brand_id));
        }
        result = await Promise.all(promises);
        
    } else if(term == "month") {
        // offsetDate.setMonth(offsetDate.getMonth() - 1);
        const promises:Promise<any>[] = []
        for(let k=0; k<30; k++){
            let date:any = convertDateToYmd(offsetDate);
            date = date.toString().split("T")[0];
            offsetDate.setDate(offsetDate.getDate() - 1)
            console.log(date);
            promises.push(getData(date, 'month', brand_id));
        }
        result = await Promise.all(promises);
    } else if(term == "hour") {
        const promises:Promise<any>[] = []
        for(let k=0; k<24; k++){
            const date = convertDateToYmd(offsetDate);
            promises.push(getData(date, 'hour', brand_id));
            offsetDate.setHours(offsetDate.getHours() - 1);
        }
        result = await Promise.all(promises);
    }
    let data:Status[] = [];
    result.map((item) => {
        data =  data.concat(item)
    })
    res.status(200).json(data);
}

const getData = async(date: string, type: string, brand_id: string) => {    
    const { error, data } = await supabaseAdmin.from("webhook")
        .select("status")
        .eq("brand_id", brand_id)
        .neq("posted", "-1")
        .ilike('create_time', `${date}%`);
    return  data;
}