import { useRouter } from "next/router";
import { Box } from '@mantine/core';
import Layout from '@/components/Layouts/Main/Index';
import Dashboard from "@/components/Pages/Dashboard";
import Comments from "@/components/Pages/Comments/Index";
import Learning from "@/components/Pages/Learning/Index";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { getBrands } from "@/utils/app/global";
import { Brands } from "@/types/brands";
import { supabase } from "@/utils/app/supabase-client";
const MainPage = () => {
    const router = useRouter();
    let { brand: brand_name, tab: page_name } = router.query;
    const [brandId, setBrrandId] = useState<string>("-1");
    useEffect(() => {
        getBrandId()
    }, [brand_name])

    const getBrandId = async() => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const brands = await getBrands(session?.user.id);
        brands.map((item: Brands) => {
            if(item.name == brand_name){
                setBrrandId(item.id);
            }
        })
    }
    /* implemented Layout in there because all pages are passed here */
    const renderPage = () => {
        if(page_name == "dashboard") {
            return <Dashboard brand_id={brandId} brand_name={brand_name}/>;
        } else if(page_name == "comments"){
            return <Comments brand_id={brandId}/>
        } else if(page_name == "learning") {
            return <Learning brand_id={brandId} brand_name={brand_name}/>
        } else {
            return <h1></h1>;
        }
    }
    
    return (
        <Box>
            <Layout
                page_name={page_name}
            >
                {
                    renderPage()
                }
            </Layout>
        </Box>
    )
}

export default MainPage;