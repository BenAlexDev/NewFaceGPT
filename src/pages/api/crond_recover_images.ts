import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { supabase, supabaseAdmin } from '@/utils/server/supabase-admin';
import { convertDateToYmd } from "@/utils/app/global";
import { access } from "fs";

type Data = {
    name: string;
};

let fb_images: any = [];
let user_images: any = [];
let brand_images: any = [];
let sources: any = [];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    sources = await getSources();
    // return;    
    getFBImages(0);
    getBrandImage(0)
    getUserImages()
    res.status(200).json(fb_images);
}

const getBrandImage = async(index: number) => {
    const {error, data:brands} = await supabaseAdmin.from("brands").select("*");
    if(brands) {
        for(let k=0; k<brands?.length; k++){
            const sources = await supabaseAdmin.from("sources").select("*").eq("brand_id", brands[k].id).eq('type', 'fb')
            if(sources.data && sources.data.length > 0) {
                try{
                    const page_id = sources.data[0]['page_id'];
                    const access_token = sources.data[0]['access_token'];
                    const url = `https://graph.facebook.com/v18.0/${page_id}?access_token=${access_token}&fields=picture.width(500)`
                    const response  = await fetch(url);
                    const data = await response.json();
                    console.log(data);
                    console.log(url)
                    // const image = data.picture.data.url;
                    // const inserted = await supabaseAdmin.from("brands").update([{
                    //     image
                    // }]).eq("id", brands[k].id)
                    // console.log(inserted.error)
                }catch(e){
                    console.log(e)
                }
                
            }
        }
    }
}

const saveRecoverdMedia = async (item: any) => {
    try {
        const access_token = sources.filter((item_source: any) => item_source.page_id == item.page_id)[0]['access_token'];
        let url = "https://graph.facebook.com/v18.0/" + item.post_id + "?access_token=" + access_token + "&fields=attachments"
        if (item.type == "ig") {
            url = "https://graph.facebook.com/v18.0/" + item.post_id + "?access_token=" + access_token + "&fields=media_url,thumbnail_url,media_type"
        }

        const response = await fetch(url);
        const data = await response.json();
        let attachments: any = {};
        if (item.type == "ig") {
            if (data.media_type == "IMAGE") {
                attachments = {
                    media_type: 'photo',
                    media: {
                        image: {
                            src: data.media_url
                        }
                    }
                }
            } else if (data.media_type == "VIDEO") {
                attachments = {
                    media_type: 'video',
                    media: {
                        source: data.media_url
                    }
                }
            }
        } else {
            attachments = data.attachments.data[0];
        }
        const { error } = await supabaseAdmin.from('webhook').update([{
            attachments
        }]).eq('id', item.id)
        console.log(error);
    } catch (e) {
        console.log(e)
        const access_token = sources.filter((item_source: any) => item_source.page_id == item.page_id)[0]['access_token'];

        let url = "https://graph.facebook.com/v18.0/" + item.post_id + "?access_token=" + access_token + "&fields=attachments"
        if (item.type == "ig") {
            url = "https://graph.facebook.com/v18.0/" + item.post_id + "?access_token=" + access_token + "&fields=media_url,thumbnail_url,media_type"
        }
        console.log(url);
    }
}
const getFBImages = async (index: number) => {
    const { error, data } = await supabaseAdmin.from('webhook').select("id, attachments, page_id, post_id, type").range(index * 1000, (index + 1) * 1000);
    if (data && data.length > 0) {
        for (let k = 0; k < data.length; k++) {
            const item = data[k];
            try {
                if (item.attachments) {
                    let expiry_date = new Date();
                    if (Object.keys(item.attachments.media).includes("source")) {
                        const source = item.attachments.media.source;
                        const splited_source = source.split("&oe=");
                        let hex_date = "";
                        if (splited_source[1] != "") {
                            if (splited_source[1].indexOf("&_nc") > -1) {
                                hex_date = splited_source[1].split("&_nc")[0];
                            } else {
                                hex_date = splited_source[1];
                            }
                            expiry_date = new Date(converHexTodate(hex_date));
                        }
                    } else {
                        expiry_date.setDate(expiry_date.getDate() - 1)
                    }
                    let offsetDate: any = new Date();
                    offsetDate.setDate(offsetDate.getDate())
                    if (offsetDate.getTime() > expiry_date.getTime()) {
                        await saveRecoverdMedia(item)
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }

        await getFBImages(index + 1)
    }
}

const getSources = async () => {
    const { error, data } = await supabaseAdmin.from("sources").select("page_id, access_token").neq("access_token", "");
    if (data) {
        return data;
    } else {
        return [];
    }
}

const converHexTodate = (hex: any) => {
    const timeInSeconds = parseInt(hex, 16)
    // convert to miliseconds
    const timeInMiliseconds = timeInSeconds * 1000
    const currentTime = new Date(timeInMiliseconds).toLocaleDateString()
    return currentTime;
}
const getUserImages = async () => {
    const { error, data } = await supabaseAdmin.from('users').select('*').like("avatar_url", "%https://%");
    const images: string[] = [];
    if (data) {
        data.map(async(item: any) => {
            
            if(item.fb_long_lived_access_token) {
                let url = "https://graph.facebook.com/v18.0/me?fields=picture.width(500)&access_token="+item.fb_long_lived_access_token;
                const response = await fetch(url);
                const data = await response.json();
                const image = data.picture.data.url;
                const { error} = await supabaseAdmin.from("users").update([{
                    avatar_url: image
                }]).eq("id", item.id)
                console.log(error)
            }
        })
    }
    return images;
}

const getBrandImages = async () => {
    const { error, data } = await supabaseAdmin.from('brands').select("image");
    const images: string[] = [];
    if (data) {
        data.map((item: any) => {
            images.push(item.image)
        })
    }
    return images;
}


