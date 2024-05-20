import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import xml2js from 'xml2js';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const path = req.body.path;
    let page_urls: string[] = [];
    let sitesmaps = await fetchSitemap(path+'sitemap.xml');
    console.log(sitesmaps);
    if(!sitesmaps) {
        sitesmaps = await fetchSitemapIndex(path+'sitemap_index.xml');
        if(!sitesmaps) {
            sitesmaps = await fetchSitemapIndex(path+'sitemap.xml');
        }
        
        if(sitesmaps){
            sitesmaps.map((item: string) => {
                page_urls.push(item);
            })    
        }
    } else {
        page_urls = sitesmaps;
    }
    
    res.status(200).json(page_urls);
}

const fetchSitemapIndex = async(url: string) => {
    try {
        const { data, status } = await axios.get(url);

        if(data == undefined || data == "undefined") {
            return false;
        }
        const xml_urls: any = await parseXml(data);
        const sitemapUrls = xml_urls.sitemapindex.sitemap.map((s: any) => s.loc[0]);
        let total_urls: any = [];
        for (const sitemapUrl of sitemapUrls) {
            let urls = [];
            if(sitemapUrl.indexOf(".xml") == -1) {
                urls = [sitemapUrl];
            } else {
                urls = await fetchSitemap(sitemapUrl);
            }
            total_urls = total_urls.concat(urls);
        }
        return total_urls;
    } catch (err) {
        return false;
    }
}

async function parseXml(xmlString: string) {
    const parser = new xml2js.Parser();
    return new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err: any, result:any) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
}

const fetchSitemap = async(url: string) => {
    try {
        const { data } = await axios.get(url);
        const xml_urls: any = await parseXml(data);
        const urls = xml_urls.urlset.url.map((u: any) => u.loc[0]);
        return urls;
    } catch (err) {
        console.error(`Error fetching ${url}`, err);
        return false;
    }
}