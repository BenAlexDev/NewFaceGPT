export interface Source {
    brand_id: string,
    id: string,
    path: string,
    type: string,
    trained: boolean,
    created_time: string;
    access_token: string,
    page_id: string,
    page_name: string,
    connected:boolean
}

export const SourceState:Source =  {
    brand_id: '',
    id: "-1",
    path: "",
    type: "",
    trained: false,
    access_token: "",
    created_time: "",
    page_id: "",
    page_name: "",
    connected: false
}