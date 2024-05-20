import { Box, Button, Flex, Image, Indicator, LoadingOverlay, Progress, Select, Text, TextInput } from "@mantine/core";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import FBAuthModal from "./FBAuthModal";
import FBPagesModal from "./FBPagesModal";
import { FC, useEffect, useState } from "react";
import { getIpAddress } from "@/libs/utils";
import io from 'socket.io-client';
import { supabase } from "@/utils/app/supabase-client";
import axios from "axios";
import { FB_CLIENT_ID, THEME_COLOR } from "@/utils/app/consts";
import { addSource, getCommentsCount, train } from '../../utils/app/train';
import { FaRegWindowClose } from "react-icons/fa";
import { SourceState, Source } from "@/types/train";
interface Props {
    nextStep: () => void;
    brandId: string
}
interface SocialChannel {
    name: string,
    icon: React.ReactElement
}

const FBBoard: FC<Props> = ({
    nextStep,
    brandId
}) => {
    
    const [openFBAuthModal, setFBAuthModal] = useState<boolean>(false);
    const [openFBPagesModal, setFBPagesModal] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("connecting")
    const [popWindow, setPopWindow] = useState<any>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [pagesList, setPagesList] = useState<any>([])
    const [selPage, setSelPage] = useState<any>(false)
    const [scrapingStatus, setScrapingStatus] = useState<string>("Not Scraped");
    const [commentsCount, setCommentsCount] = useState<string>("0");
    const [progress, setProgress] = useState<Number>(0);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [longLivedToken, setLongLivedToken] = useState<string>("");
    const [fbSource, setFbSource] = useState<Source>(SourceState);
    const [socialChannels, setSocialChannels] = useState<SocialChannel[]>([
        {
            name: 'Facebook',
            icon: <FaFacebook color='#1877F2' size={30} />
        },
        {
            name: 'Instagram',
            icon: <FaInstagram color='#cd4343' size={30} />
        }
    ]);
    const [selSocial, setSelSocial] = useState<string>('Facebook');

    useEffect(() => {
        socketInitializer();
        getFBLongTokens();
    }, [])

    useEffect(() => {
        if (longLivedToken != "" && longLivedToken) {
            saveLongLivedToken();
            getPagesList(longLivedToken)
            popWindow.close();
        }
    }, [longLivedToken])

    const saveLongLivedToken = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch('/api/social/save_fb_long_token', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: session?.user?.id,
                long_lived_token: longLivedToken
            }),
        })
    }

    let fb_pages_list: any = [];
    const getPagesList = async (long_token: string) => {
        setIsLoading(true);
        fb_pages_list = [];
        try {
            const response = await axios.get(
                "https://graph.facebook.com//me/accounts?fields=access_token,category,category_list,name,picture.height(500).width(500){url},id,tasks,instagram_business_account{id,name,username,profile_picture_url}",
                {
                    headers: {
                        Authorization: `Bearer ${long_token}`,
                    },
                }
            );
            const data = response.data.data;
            const paging = response.data.paging;
            const next_page = paging.next;

            if (data) {
                fb_pages_list = data;
                if (!next_page && next_page != "") {
                    setPagesList(data)
                    if (data.length > 0) {
                        setSelPage(data[0])
                    }
                    setStatus("pages_list");
                } else {
                    await getFBPageLists(next_page, long_token);
                }
            }
        } catch (e) {
            console.log(e);
            deleteFbLongToken()
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if(brandId != "-1"){
            getFBToken();
        } else {
            setScrapingStatus('Not Scraped')
            setStatus("connecting")
            setFbSource(SourceState)
        }
    }, [brandId])

    const setBrandImage = async () => {
        const res = await fetch('/api/social/set_brand_image', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id: brandId,
                image: selPage.picture.data.url
            }),
        })
    }

    const getFBPageLists = async (url: string, long_token: string) => {
        console.log(url);
        const response = await axios.get(
            url,
            {
                headers: {
                    Authorization: `Bearer ${long_token}`,
                },
            }
        );
        const data = response.data.data;
        const paging = response.data.paging;
        const next_page = paging.next;
        fb_pages_list = fb_pages_list.concat(data)
        if (next_page && next_page != "") {
            await getFBPageLists(next_page, long_token);
        } else {
            setPagesList(fb_pages_list);
            setSelPage(fb_pages_list[0])
            setStatus("pages_list");
        }
    }

    const deleteFbLongToken = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch("/api/social/delete_fb_long_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: session?.user?.id,
            }),
        });
    }

    const getFBToken = async () => {
        
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch("/api/social/get_fb_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id: brandId
            }),
        });
        if (res.status == 200) {
            const _data = await res.json();
            setFbSource(_data)
            setScrapingStatus('scraped')
            setStatus("pages_list")
        } else {
            setScrapingStatus('Not Scraped')
            setStatus("connecting")
            setFbSource(SourceState)
        }
    }
    const getFBLongTokens = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch("/api/social/get_fb_long_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: session?.user?.id,
            }),
        });
        if (res.status == 200) {
            const data = await res.json();
            const token = data.token;
            if (token && token != "") {
                await getPagesList(token);
            }
        }
    }

    const scrapComments = async () => {
        setProgress(0)
        setIsTraining(true);
        setScrapingStatus("Subscribing...");
        setBrandImage()
        await subscribed().then(async (data) => {
            setProgress(10);
            setScrapingStatus("Scraping...")
            await fetchPostComments1(selPage.id, selPage.access_token, selPage.name);
        });
    };

    const subscribed = async () => {
        await axios.post(
            `https://graph.facebook.com/${selPage.id}/subscribed_apps?subscribed_fields=feed&access_token=${selPage.access_token}`
        );
    };

    let comments: any = [];
    let parent_comments: any = [];

    const fetchPostComments1 = async (
        page_id: string,
        token: string,
        page_name: string,
        paging?: string
    ) => {
        try {
            const response = await axios.get(
                `https://graph.facebook.com/${page_id}/ads_posts`,
                {
                    params: {
                        access_token: token,
                        fields:
                            "comments.limit(300){comments.summary(true),parent,message,from,likes,created_time,comment_count,like_count,is_hidden,message_tags},message",
                        include_inline_create: true,
                        limit: 10,
                        after: paging,
                    },
                }
            );

            let exist_comment: boolean = false;

            const filterComments = response.data.data
                .filter((item: any) => item.comments)
                .map((item: any) =>
                    item.comments.data.map((abc: any) => {
                        comments.push(abc)
                        exist_comment = true;
                    })
                );

            if (exist_comment) {
                parent_comments.push(response.data.data);
            }
            if (comments.length <= 2000 && response.data.paging.cursors.after) {
                fetchPostComments1(
                    page_id,
                    token,
                    page_name,
                    response.data.paging.cursors.after
                );
            } else {
                trainFB(parent_comments);
                return parent_comments;
            }
        } catch (e) {
            trainFB(parent_comments);
        }
    };

    const trainFB = async (comments: any) => {
        // comments = comments_data;
        setCommentsCount(getCommentsCount(comments).toString());
        setProgress(50)
        const added_source = await addSource(brandId, selPage.name, 'fb', "0", selPage.access_token, selPage.id);
        let source: any = false;
        console.log(added_source);
        if (added_source.status == 200) {
            source = added_source.source;
            setProgress(60)
            setScrapingStatus("training...");
            await train(comments, brandId, source.id, selPage.id, 'fb', selPage.name);
            setProgress(100)
            setScrapingStatus('scraped')
            setIsTraining(false);
        } else {
            setProgress(100);
            setScrapingStatus('You already created a page')
            setIsTraining(false);
        }
    }
    
    const socketInitializer = async () => {
        const origin = window.location.origin.split(":3000")[0];
        const socket = io('https://app.replient.ai');
        socket.on('connect', () => {
            console.log("-------------Connnect123----------")
        })
        const ip = await getIpAddress();
        socket.on('receive_tokens', (tokens_info: any) => {
            const ip_ = tokens_info.ip;
            console.log(tokens_info);
            consoleSupaase()
            if (ip_ == ip) {
                setLongLivedToken(tokens_info.long_lived_token);
            }
        })
    }

    const consoleSupaase = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        console.log("----------Session------------")
        console.log(session);
    }

    const openFacebookWindow = () => {
        // const pop_window_ = window.open("https://app.replient.ai/third/faceboook?#access_token=EAAW2ux9zq1QBO4lcCm4vMZBf5oGlpZB5vRyz0P4BZAz4Ly6PYzquPoXYvZAYYFYZB5R8rHnqGOK6MEMCgsPMCZA5sCPUZAIU6ikbrB1ZC2NNW29DU4NquQcw61h9XpEY74A3YZBgljcynsoeq8m6tqPXtk8jVOMgtZAKbQuoXQlte0GCYyZAxlI0rItByUSJCKXwGZByQF1dQeymAvADZBuegKEtZC5zjA&data_access_expiration_time=1708192420&expires_in=3980&long_lived_token=EAAW2ux9zq1QBO1Cjuqw2wkaveWxfaaYPEdki84MucIrNV6Xa8iZCYw09CYN7IZBBUbrJScn4XmZAcw9gtSi8Gv7CpSkZChWAiArDfi4qgkx3xZAd6YR8WipBN5ykRYZBL2ZCqR8uxyriCmh4wBLEneFcgLZA7rmrSPLgs6FWkVQIqJZCs5GOzfW8ZA64fsWABynotV", '','width=700,height=800');
        // setPopWindow(pop_window_)
        // return;
        const base = "https://www.facebook.com/dialog/oauth";
        const clientId = FB_CLIENT_ID;
        const responseType = "token";
        const displayType = "popup";
        const scopes = [
            "instagram_manage_comments",
            "instagram_basic",
            "pages_read_engagement",
            "pages_manage_ads",
            "pages_show_list",
            "ads_management",
            "pages_manage_posts",
            "public_profile",
            "pages_manage_engagement",
            "pages_read_user_content",
            "business_management",
            "pages_manage_metadata"
            // Add or remove scopes as needed
        ];
        const redirectUri = "https://app.replient.ai/third/facebook";
        const encodedRedirectUri = encodeURIComponent(redirectUri);
        const url = `${base}?response_type=${responseType}&client_id=${clientId}&scope=${encodeURIComponent(scopes.join(' '))}&redirect_uri=${encodedRedirectUri}&display=${displayType}`;
        const pop_window = window.open(url, '', 'width=700,height=800');
        setPopWindow(pop_window)
    };

    const parsePagesList = () => {
        const data: any = [];

        pagesList.map((item: any) => {
            data.push(
                {
                    label: item.name,
                    value: item.access_token
                }
            )
        })
        return data;
    }

    const renderStatus = () => {
        if (status == "connecting") {
            return <Flex pt={32} pb={12} justify={'flex-end'} pr={24}>
                <Button
                    radius={30}
                    sx={(theme) => ({
                        color: '#18232A',
                        '&:hover': {
                            background: '#eded15'
                        }
                    })}
                    bg={"#E0E049"}
                    className="button-background"
                    onClick={() => {
                        openFacebookWindow()
                        // nextStep()
                    }}
                >
                    <Text size={14} weight={'600'} className="body-normal">
                        Connect
                    </Text>
                </Button>
            </Flex>
        } else if (status == "pages_list") {
            return <Box pl={24} pt={12} pb={10}>
                <Box sx={(theme) => ({
                    borderBottom: `1px solid #E5E7EB`
                })}>
                    <Text color="#111928" className="headerline" size={18} weight={700}>
                        Integrated Pages Information
                    </Text>
                    <Flex mr={8} ml={8} p={24} justify={'space-between'}>
                        <Flex
                            direction={'column'}
                            gap={12}
                        >
                            <Flex gap={8} align={'center'}>
                                <Box w={105}>
                                    <Text weight={600} size={14} color="#637381">Page Name: </Text>
                                </Box>
                                <Box>
                                    {
                                        fbSource.path == "" ? 
                                        <Select
                                            data={parsePagesList()}
                                            onChange={(value) => {
                                                const _pages_list = JSON.parse(JSON.stringify(pagesList))
                                                _pages_list.map((item: any) => {
                                                    if (item.access_token == value) {
                                                        setSelPage(item)
                                                    }
                                                })
                                            }}
                                            searchable
                                            value={selPage.access_token}
                                        /> : <TextInput value={fbSource.path} disabled/>
                                    }
                                </Box>
                            </Flex>
                            <Flex gap={8} align={'center'}>
                                <Box w={105}>
                                    <Text weight={600} size={14} color="#637381">Page ID: </Text>
                                </Box>
                                <Box>
                                    <Text color="#637381" size={14} weight={600}>{
                                        fbSource.path == ""?
                                        selPage.id:fbSource.fb_page_id
                                    }</Text>
                                </Box>
                            </Flex>
                        </Flex>
                        <Flex gap={8}>
                            <Text color="#637381" size={14} weight={600}>
                                Page Status:
                            </Text>
                            <Text color={`${scrapingStatus == 'Not Scraped' ? '#EE717F' : '#F49E72'}`} size={14} weight={600}>
                                {
                                    scrapingStatus
                                }
                            </Text>
                        </Flex>

                    </Flex>
                    {
                        isTraining ?
                            <Flex justify='space-between' gap={16} p={24} w={'100%'}>
                                <Flex direction={'column'} gap={6} w={'100%'}>
                                    <Flex gap={14} align={'center'} w={'100%'}>
                                        <Image src={'/icons/shape.svg'} alt="" width="20px" />
                                        <Flex gap={5} justify={'space-between'} direction={'column'} w={'100%'}>
                                            <Text weight={600} size={14} color="#18232A">
                                                Getting historic comment data
                                            </Text>
                                            <Flex gap={15} align={'center'} justify={'space-between'} w={'100%'}>
                                                <Text color="#919EAB" weight={500} size='12px'>
                                                    {commentsCount} comments getting saved (do not close this window)
                                                </Text>
                                                <Text color="#919EAB" weight={500} size='12px'>
                                                    {progress.toString()}%
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                    <Progress style={{ width: '100%' }} value={Number(progress)} color={THEME_COLOR}/>
                                </Flex>
                                <FaRegWindowClose
                                    style={{ color: '#637381', cursor: 'pointer' }}
                                    onClick={() => {
                                        // stopTraining(key);
                                    }}
                                />
                            </Flex> : <></>
                    }

                </Box>
                {
                    scrapingStatus == "Not Scraped" ?
                        <Flex mr={8} ml={8} justify={'flex-end'} mt={32}>
                            <Button
                                radius={30}
                                sx={(theme) => ({
                                    color: '#18232A',
                                    border: '1px solid #eded15',
                                    '&:hover': {
                                        background: 'transparent'
                                    }
                                })}
                                bg={'transparent'}
                                onClick={() => {
                                    scrapComments()
                                }}
                                className="transparent-button"
                            >
                                <Text size={14} weight={'600'} className="body-normal">
                                    Save latest comments now
                                </Text>
                            </Button>
                        </Flex> :
                        <Flex pt={12} pb={12} justify={'flex-end'} pr={24}>
                            <Button
                                radius={30}
                                sx={(theme) => ({
                                    color: '#18232A',
                                    '&:hover': {
                                        background: '#eded15'
                                    }
                                })}
                                bg={"#E0E049"}
                                className="button-background"
                                onClick={() => { nextStep() }}
                            >
                                <Text size={14} weight={'600'} className="body-normal">
                                    Continue
                                </Text>
                            </Button>
                        </Flex>
                }

            </Box>
        }
    }

    return (
        <Flex
            justify={'center'}
            mt={50}
            direction={'column'}
            align={'center'}
        >
            <Box
                style={{
                    boxShadow: "0px 0px 2px rgba(145, 158, 171, 0.24), 0px 20px 40px -4px rgba(145, 158, 171, 0.24)",
                    borderRadius: '15px'
                }}
                w={'100%'}
            >
                <Box
                    pb={15}
                    pt={15}
                    style={{
                        borderBottom: '1px solid #E5E7EB',
                    }}
                    pl={20}
                >
                    <Text weight={'bold'} size={'20px'}
                        className="headerline"
                    >
                        Select Social Platform
                    </Text>
                </Box>
                <Flex
                    pl={20}
                    pt={30}
                    pb={20}
                    sx={(theme) => ({
                        borderBottom: '1px solid #E5E7EB'
                    })}
                    gap={15}
                >
                    {
                        socialChannels.map((item: SocialChannel, key: number) =>
                            <Indicator 
                                key={key}
                                label={
                                <Box>
                                    {
                                        item.name == "Facebook" && fbSource.path != "" ?
                                            <Image src={'/icons/check.svg'} alt=""/> : <></>
                                    }
                                </Box>
                            } position="bottom-end" color="transparent" inline size={20} offset={5}>
                                <Flex
                                    key={key}
                                    p={15} gap={10} justify={'center'} align={'center'} direction={'column'}
                                    bg={`${item.name == selSocial ? '#919EAB52' : 'white'}`}
                                    sx={(theme) => ({
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        border: `1px solid ${theme.colors.gray[4]}`,

                                    })}
                                    onClick={() => {
                                        setSelSocial(item.name)
                                    }}
                                >
                                    {item.icon}
                                    <Text size={14} color="#18232A" weight={600} className="body-normal">
                                        {item.name}
                                    </Text>
                                </Flex>
                            </Indicator>

                        )
                    }
                </Flex>
                {
                    renderStatus()
                }
            </Box>
            <FBAuthModal open={openFBAuthModal} close={() => { setFBAuthModal(false) }} />
            <FBPagesModal open={openFBPagesModal} close={() => { setFBPagesModal(false) }} />
            <LoadingOverlay visible={isLoading} className="overloader" />
        </Flex>
    )
}

export default FBBoard;