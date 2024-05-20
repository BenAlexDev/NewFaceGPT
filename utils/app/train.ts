import PizZip, { LoadData } from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as XLSX from "xlsx";
import PDFParse from 'pdf-parse';
import { Source } from '@/types/train';
import { comment } from 'postcss';

export const fetchSitemaps = async (path: string) => {
    let sitemaps: any = false;
    try {
        sitemaps = [];
        const res = await fetch('/api/train/get_page_urls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: path })
        });
        if (res.ok) {
            if (res.status == 200) {
                sitemaps = await res.json();
            }
        } else {
            sitemaps = false;
        }

    } catch (e) {
        sitemaps = false;
    }

    return sitemaps;
}

/*
export const train = async (text: string) => {
    try {
        const res = await fetch('/api/train/train_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });
        if (res.status == 200) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}
*/

export const train = async (
    text: string,
    brand_id: string,
    source_id: string,
    url: string,
    type: string,
    page_name?: string,
) => {
    try {
        const res = await fetch("/api/train/train_file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                brand_id,
                url,
                type,
                source_id,
                page_name,
            }),
        });
        if (!res.ok) {

        }
        return res;
    } catch (e) {
        console.log(e);
    }
    return { status: '201' };
};



export const addSource = async(
    brand_id: string, 
    source_name: string, 
    type: string,
    file_size: string,
    access_token: string='', 
    page_id: string='',
    connected?:boolean
) => {
    const res = await fetch('/api/train/add_source_path', {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: source_name, 
                type, 
                brand_id, 
                access_token, 
                page_id,
                file_size,
                connected
            })
    });
    
    const source = await res.json();
    return {source, status: res.status};
    
}

export const deleteSelectedFiles = async (source_id: number) => {
    try {
        const res = await fetch('/api/train/delete_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source_id: source_id })
        });
        if (res.status == 200) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const getFilecontent = async (file: File) => {
    const extension = getFileExtension(file.name).toUpperCase();
    let text = '';
    if (extension == "DOC" || extension == 'DOCX') {
        text = await getDocFileContent(file);
    } else if (extension == "CSV") {
        text = await getCsvFileContent(file);
    } else if (extension == 'XLS' || extension == "XLSX") {
        text = await getXlsFileContent(file);
    } else if (extension == 'PDF') {
        text = await getPdfFilecontent(file);
    }

    return {
        name: file.name,
        text
    };
}

const getPdfFilecontent = async (file: File) => {
    let text = '';
    const data = new FormData()
    data.set('file', file)
    const res = await fetch('/api/train/pdf-parser', {
        method: 'POST',
        body: data
    })
    if (res.status == 200) {
        const data = await res.json();
        text = data.text
    }
    return text;
}

export const getFileExtension = (file_name: string) => {
    const fileNameParts = file_name.split('.');
    const fileExtension = fileNameParts[fileNameParts.length - 1];
    return fileExtension;
}

const getDocFileContent = async (file: File) => {
    const readAsDataURL = () => {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) {
                if (e.target) {
                    var binaryString = e.target.result;
                    resolve(binaryString);
                } else {
                    reject('Error: e.target is null or undefined');
                }
            };

            reader.onabort = function (e) {
                reject('File read canceled');
            };

            reader.readAsBinaryString(file);
        });
    };

    const result = await readAsDataURL() as LoadData;
    const zip = new PizZip(result);
    const doc = new Docxtemplater().loadZip(zip);
    const text = doc.getFullText();
    return text;
}

const getCsvFileContent = async (file: File) => {
    let text = '';
    const readAsDataURL = () => {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) {
                if (e.target) {
                    resolve(e.target.result);
                } else {
                    reject('Error: e.target is null or undefined');
                }
            };

            reader.onabort = function (e) {
                reject('File read canceled');
            };

            reader.readAsText(file);
        });
    };
    text = await readAsDataURL() as string;
    return text;
}

const getXlsFileContent = async (file: File) => {
    let text = '';
    const readAsDataURL = () => {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) {
                if (e.target) {
                    var binaryString = e.target.result;
                    resolve(binaryString);
                } else {
                    reject('Error: e.target is null or undefined');
                }
            };

            reader.onabort = function (e) {
                reject('File read canceled');
            };

            reader.readAsBinaryString(file);
        });
    };

    const result = await readAsDataURL() as LoadData;

    let workbook = XLSX.read(result, {
        type: 'binary'
    });

    workbook.SheetNames.forEach(function (sheetName) {
        let XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        let json_object = XL_row_object;
        json_object.map((item: any) => {
            for (let key in item) {
                text += `${key}:${item[key]}`;
            }
        })
    })

    return text;
}

export const 
filterComments = (fb_json: any, page_id: string, page_name: string) => {

    const json: any = [];
    for (let k = 0; k < fb_json.length; k++) {
        const item = fb_json[k];
        try {
            const content = item.comments.data;
            const content_: any = [];
            for (let k = 0; k < content.length; k++) {
                const chck = chkEnableComments(content[k], page_id, page_name);
                if(chck) {
                    content_.push(item);
                }
            }
            item.content = content_;
        } catch (e) {

        }
        json.push(item);
    }
    
    console.log("-------Filtered Comments----------");
    console.log(json);

    return json;
}

const chkEnableComments = (item: any, page_id: string, page_name: string) => {
    const is_hidden = item.is_hidden ? 'Yes' : 'No';
    let is_like = 'No';
    
    if (Object.keys(item).includes('likes')) {
           for (let k = 0; k < item.likes.data.length; k++) {
            if (item.likes.data[k].name == page_name) {
                is_like = "Yes";
            }
        }
    }
    
    if (is_like == "Yes" || is_hidden == "Yes") {
        return true;
    } else {
        return false;
    }   
}

export const getCommentsCount = (comments: any) => {
    let count = 0;
    comments.map((items:any) => {
        items.map((item:any) => {
            if (Object.keys(item).includes("comments")) {
                console.log(item.comments)
                const content = item.comments.data;
                content.map((contentitem:any) => {
                    count++;
                })
            }
        })
    })
    return count;
}


