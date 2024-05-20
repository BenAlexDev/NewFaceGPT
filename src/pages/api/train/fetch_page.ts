// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import cheerio  from 'cheerio';

const removeTags = [
    "style",
    "script",
    "iframe",
    "img",
    "noscript"
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const url = req.body.url;
    try{
        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)  \
        AppleWebKit/537.36 (KHTML, like Gecko) \
        Chrome/90.0.4430.212 Safari/537.36');
        const webResponse = await fetch(url, { headers });

        
        let homeHtml = '';
        if (webResponse.ok) {
            homeHtml = await webResponse.text();
            const text = getTextChild(homeHtml);
            res.status(200).json({text: text})
        } else{
            res.status(201).json({text: ''})
        }
    } catch(e){
        console.log('--------Fetch page error------------')
        console.log(e);
        res.status(202).json({text: ''})
    }
}

const getTextChild = (html: string) => {
    let text = '';
    const $ = cheerio.load(html);

    removeTags.map((tag) => {
        $("body").find(`${tag}`).remove();
    })
    $('style').empty();
    text = $("body").text();
    const lines = text.split("\n");
    const concatenatedFileText = lines.join(" ").trim().replace(/\s+/g, " ");
    return concatenatedFileText;
}
