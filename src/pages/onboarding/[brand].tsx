import { Box, Button, Flex, Stepper, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import SocialBoard from "@/components/Board/SocialBoard";
import Layout from '@/components/Layouts/Main/Index';
import SiteBoard from "@/components/Board/SiteBoard";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { getBrands } from "@/utils/app/global";
import { Brands } from "@/types/brands";
import FileBoard from "@/components/Board/FileBoard";
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_SPLITER_COLOR } from "@/utils/app/consts";
import { supabase } from "@/utils/app/supabase-client";
import { useMediaQuery } from '@mantine/hooks';
import { FaAngleDoubleRight } from "react-icons/fa";
const Board = () => {

    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
    const [active, setActive] = useState(0);
    const [brandId, setBrandId] = useState<string>("-1");
    const [title, setTitle] = useState<string>('');
    const [subTitle, setSubTitle] = useState<string>('');
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const router = useRouter();
    const user = useUser();
    const { brand: brand_name } = router.query;

    useEffect(() => {
        getBrandId();
    }, [brand_name])

    useEffect(() => {
        if (active == 0) {
            setTitle('Connect your Socials');
            setSubTitle('Connect your platforms and scrape historic comments');
        } else if (active == 1) {
            setTitle('Connect your Websites');
            setSubTitle('Connect your domains and scrape website content');
        } else if (active == 2) {
            setTitle('Upload informative Files');
            setSubTitle('Add Files with readable text-content.');
        }
    }, [active])

    const getBrandId = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const brands = await getBrands(session?.user.id);
        brands.map((item: Brands) => {
            if (item.name == brand_name) {
                setBrandId(item.id);
            }
        })
    }
    return (
        <Layout page_name={'onboarding'} >
            <Flex
                className="board-page"
                direction={'column'}
                align={'center'}
                p={isMobile?0:15}
            >
                {
                    isMobile?<Flex  
                        w={`calc(100% + 30px)`}
                        mt={-15}
                        pb={12}
                        pt={12}
                        pl={5}
                        pr={5}
                        justify={'center'}
                        align={'center'}
                        gap={'6px'}
                        sx={(theme) =>({
                            boxShadow: `0px 1px 2px 0px rgba(0, 0, 0, 0.08)`,
                            borderBottom: `1px solid rgba(145, 158, 171, 0.24)`
                        })}
                    >
                        <Flex gap={4} align={'center'}>
                            <Flex 
                                align={'center'} 
                                justify={'center'} 
                                direction={'column'}
                                bg={active == 0?THEME_COLOR:'rgba(145, 158, 171, 0.24)'}
                                w={20} h={20} sx={(theme) =>({borderRadius: '20px'})}
                            >
                                <Text color={`${active == 0?'white':'#18232A'}`} size={12} weight={400}>
                                    1
                                </Text>
                            </Flex>
                            <Text size={11} color={active== 0?'#18232A':'#919EAB'} weight={active == 0?700:500}>
                                Connect Social
                            </Text>
                            <FaAngleDoubleRight size={11} color='#919EAB'/>
                        </Flex>
                        <Flex gap={4} align={'center'}>
                            <Flex 
                                align={'center'} 
                                justify={'center'} 
                                direction={'column'}
                                bg={active == 1?THEME_COLOR:'rgba(145, 158, 171, 0.24)'}
                                w={20} h={20} sx={(theme) =>({borderRadius: '20px'})}
                            >
                                <Text color={`${active == 1?'white':'#18232A'}`} size={12} weight={400}>
                                    2
                                </Text>
                            </Flex>
                            <Text size={11} color={active== 1?'#18232A':'#919EAB'} weight={active == 1?700:500}>
                                Add Sitemaps
                            </Text>
                            <FaAngleDoubleRight size={11} color='#919EAB'/>
                        </Flex>
                        <Flex gap={4} align={'center'}>
                            <Flex 
                                align={'center'} 
                                justify={'center'} 
                                direction={'column'}
                                bg={active == 2?THEME_COLOR:'rgba(145, 158, 171, 0.24)'}
                                w={20} h={20} sx={(theme) =>({borderRadius: '20px'})}
                            >
                                <Text color={`${active == 2?'white':'#18232A'}`} size={12} weight={400}>
                                    3
                                </Text>
                            </Flex>
                            <Text size={11} color={active== 2?'#18232A':'#919EAB'} weight={active == 2?700:500}>
                                Add Files
                            </Text>
                            <FaAngleDoubleRight size={11} color='#919EAB'/>
                        </Flex>
                    </Flex>:<></>
                }
                <Flex align={'flex-start'} justify={'flex-start'} w={'100%'} mt={32}>
                    <Box>
                        <Text size={24} weight={'bold'} className="headerline">
                            {title}
                        </Text>
                        <Text size={16} color='#637381' weight={400}>
                            {subTitle}
                        </Text>
                    </Box>
                    <Box pt={20} pb={30}
                        sx={(theme) => ({
                            borderBottom: `1px solid ${THEM_SPLITER_COLOR}`
                        })}
                    ></Box>
                </Flex>
                {
                    !isMobile?
                    <Stepper active={active} onStepClick={setActive} color="yellow" w={'100%'} mt={50}>
                     <Stepper.Step
                        label={
                            <Flex
                                gap={5}
                                direction={'column'}
                                align={'center'}
                                w={'300px'}
                            >
                                <Text size={14} weight={600} color={active == 0?'rgba(24, 35, 42, 1)':'rgba(145, 158, 171, 1)' }>
                                    Connect Pages
                                </Text>
                                {
                                    active == 0 ?
                                        <Text
                                            size={12}
                                            color="#18232A"
                                            weight={500}
                                            align="center"
                                        >
                                            Please connect your Social account and grant access to all resources you want to use with replient. You can use only one page per brand.
                                        </Text> : <></>
                                }
                            </Flex>
                        }

                        allowStepSelect={false}
                    >
                        <SocialBoard
                            // nextStep={openFacebookWindow}
                            nextStep={nextStep}
                            brandId = {brandId}
                        />
                        </Stepper.Step>
                        <Stepper.Step label={
                            <Flex
                                gap={5}
                                direction={'column'}
                                align={'center'}
                                w={'300px'}
                            >
                                <Text size={14} weight={600}
                                    color={active == 1?'rgba(24, 35, 42, 1)':'rgba(145, 158, 171, 1)' }
                                >
                                    Add Sitemaps
                                </Text>
                                {
                                    active == 1 ? <Text
                                        size={12}
                                        color="#18232A"
                                        weight={500}
                                        align="center"
                                    >
                                        Please add all domains of your brand, where we can find relevant information about your company or service. You can add multiple domains here.
                                    </Text> : <></>
                                }
                            </Flex>
                        } allowStepSelect={false}>
                            <SiteBoard
                                nextStep={nextStep}
                                prevStep={prevStep}
                                brand_id={brandId}
                            />
                        </Stepper.Step>
                        <Stepper.Step
                            label={
                                <Flex
                                    gap={5}
                                    direction={'column'}
                                    align={'center'}
                                    w={'300px'}
                                >
                                    <Text size={14} weight={600} color={active == 2?'rgba(24, 35, 42, 1)':'rgba(145, 158, 171, 1)' }>
                                        Add Files
                                    </Text>

                                    {
                                        active == 2 ?
                                            <Text
                                                size={12}
                                                color="#18232A"
                                                weight={500}
                                                align="center"
                                            >
                                                Please upload relevant files for your brand where we can find more information about your product or service.  .pdf, .txt and .doc allowed
                                            </Text> : <></>
                                    }
                                </Flex>
                            }
                            allowStepSelect={false}>
                            <FileBoard
                                nextStep={nextStep}
                                prevStep={prevStep}
                                brand_id={brandId}
                                brand_name={brand_name}
                            />
                        </Stepper.Step>
                        <Stepper.Completed>
                            Completed, click back button to get to previous step
                        </Stepper.Completed>
                    </Stepper>:<></>
                }
                
            </Flex>
        </Layout>
    )
}



export default Board;