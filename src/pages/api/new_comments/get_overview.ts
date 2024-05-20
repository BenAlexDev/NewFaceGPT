import { convertDate, convertDateIso, convertDateToYmd } from '@/utils/app/global';
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const brand_id = req.body.brand_id;
    const type = req.body.type;
    let offsetDate:any = new Date();
    
    if(type == "day") {
        offsetDate.setDate(offsetDate.getDate() - 5)
        const promises:Promise<any>[] = []
        for(let k=0; k<7; k++){
            let date:any = convertDateToYmd(offsetDate);
            date = date.toString().split("T")[0];
            offsetDate.setDate(offsetDate.getDate() + 1)
            promises.push(getData(date, 'day', brand_id));
        }
        const result = await Promise.all(promises);
        res.status(200).json(result);
    } else if(type == "month") {
        // offsetDate.setMonth(offsetDate.getMonth() - 1);
        offsetDate.setDate(offsetDate.getDate() - 30)
        const promises:Promise<any>[] = []
        for(let k=0; k<=30; k++){
            let date:any = convertDateToYmd(offsetDate);
            date = date.toString().split("T")[0];
            offsetDate.setDate(offsetDate.getDate() + 1)
            console.log(date);
            promises.push(getData(date, 'month', brand_id));
        }
        const result = await Promise.all(promises);
        res.status(200).json(result);
    } else if(type == "hour") {
        const promises:Promise<any>[] = []
        offsetDate.setHours(offsetDate.getHours() - 24);

        for(let k=0; k<=24; k++){
            const date = convertDateToYmd(offsetDate);
            promises.push(getData(date, 'hour', brand_id));
            offsetDate.setHours(offsetDate.getHours() + 1);
        }
        const result = await Promise.all(promises);
        res.status(200).json(result);
    }
}

const getData = async(date: string, type: string, brand_id: string) => {    
    const {error, data} = await supabaseAdmin.from('webhook').select("id").eq("brand_id", brand_id).ilike('create_time', `${date}%`);
    if(type == 'day'){
        date = convertDateIso(date.split("T")[0]);
    } else if(type == 'month') {
        date = date.split("-")[2];
    } else if(type == 'hour') {
        date = date.split("T")[1];
    }
    if(data) {
        return {date, count: data.length};
    } else {
        return {date, count: 0};
    }
}