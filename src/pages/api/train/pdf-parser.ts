// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from "formidable";
import FormData from "form-data";
import fs from 'fs';
import PDFParse from 'pdf-parse';
import PdfParse from 'pdf-parse';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const form = formidable({ multiples: true });

    const formData = new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                reject("error");
            }
            resolve({ fields, files });
        });
    });

    try {
        const { fields, files }: any = await formData;
        let data = fs.readFileSync(files.file[0].filepath);
        const text = (await PdfParse(data)).text;
    
        res.status(200).send({ text: text.replace(/\n/, '') });
        
    } catch (e) {
        res.status(400).send({ status: "invalid submission" });
        return;
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};