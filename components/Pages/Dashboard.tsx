import { Avatar, Badge, Box, Button, Flex, Grid, Image, Loader, Menu, ScrollArea, Switch, Text } from "@mantine/core";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { CommentType } from "@/types/new_comments";
import { IconBrandFacebook, IconCalendar } from "@tabler/icons-react";
import { convertDate } from "@/utils/app/global";
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_BORDER_COLOR, THEM_SPLITER_COLOR } from "@/utils/app/consts";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { useMediaQuery } from '@mantine/hooks';

interface Props {
    brand_id: string,
    brand_name: string | string[] | undefined,
}

const Dashboard: FC<Props> = ({
    brand_id,
    brand_name
}) => {

    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
    const [overviewfilters, setOVverviewFilters] = useState<any>([
        { name: 'Last 30 days', type: 'month' },
        { name: 'Last 7 days', type: 'day' },
        { name: 'Last 24 hours', type: 'hour' },
    ])
    const [newComments, setNewComments] = useState<CommentType[]>([]);
    const [loadNewComments, setLoadNewComments] = useState<boolean>(false);
    const [newCommentsCount, setNewCommentsCount] = useState<number>(0);
    const [selOverviewFilter, setSelOverviewFilter] = useState<any>(overviewfilters[1])
    const [savedTime, setSavedTime] = useState<string>('');
    const [socialsConnectStatus, setSocialsConnectStatus] = useState<{ type: string, connected: boolean }[]>([]);

    const [overview, setOverview] = useState<any>(
        {
            title: '',
            chart: {
                type: 'areaspline',
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    formatter: function (this: any): any {

                        if (this.value) {
                            if (this.value % 1 === 0) {
                                return this.value;
                            }
                        }
                    }
                },
                gridLineDashStyle: 'longdash',
                gridLineWidth: 2,
                startOnTick: false,
            },
            xAxis: {
                title: {
                    text: ''
                },
                categories: [

                ],
                lineColor: THEM_BORDER_COLOR,
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b><br/>',
                shared: true,
                borderColor: THEME_COLOR
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                },
                series: {
                    fillOpacity: 0.5,
                },

            },
            credits: {
                enabled: false
            },
            series: [
                {
                    data: [],
                    color: {
                        linearGradient: [0, 0, 0, 800],
                        stops: [
                            [0, THEME_COLOR],
                            [1, 'white']
                        ],
                        color: THEME_COLOR
                    },

                    name: 'comments answered',
                    lineWidth: 4,
                },

            ]
        }
    );

    const [cronType, setCronType] = useState<string>("manually");
    const [postedData, setPostedData] = useState<any>(
        {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false,
                margintop: -50,
                marginbottom: -50,
                marginleft: 0,
                marginright: 0,
            },
            title: {
                text: '',
                align: 'center',
                verticalAlign: 'middle',
                y: -30
            },
            tooltip: {
                pointFormat: '',
                enabled: false
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        distance: -100,
                        style: {
                            fontWeight: 'bold',
                            color: 'white'
                        }
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '100%'],
                    size: '200%',
                    thickness: 20,
                    height: 500
                }
            },
            series: [{
                type: 'pie',
                size: '200%',
                innerSize: '150%',
                pointpadding: 0,
                grouppadding: 0,
                data: [

                ]
            }]
        }
    );
    
    const getNewComments = async () => {
        setLoadNewComments(true);
        const res = await fetch('/api/new_comments/get_unread_comments', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id
            }),
        });
        if (res.status == 200) {
            const _data = await res.json();
            setNewCommentsCount(_data.total_count);
            setNewComments(_data.data);
        }
        setLoadNewComments(false);
    }
    
    const changeCronType = async (status: string) => {
        const res = await fetch("/api/train/change_cron_status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
                status
            }),
        });
    }

    useEffect(() => {
        getNewComments();
        getCronStatus();
        getConnectStatus();
    }, [brand_id])

    useEffect(() => {
        getOverview();
        getPostedData();
    }, [selOverviewFilter, brand_id])

    const getConnectStatus = async () => {
        const res = await fetch('/api/social/get_connected_status', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
            }),
        })
        if (res.status == 200) {
            const data_ = await res.json();
            setSocialsConnectStatus(data_);
        }
    }

    const getPostedData = async () => {
        const res = await fetch("/api/train/get_posted_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
                term: selOverviewFilter.type
            }),
        });
        if (res.status == 200) {
            const data = await res.json();
            let manually = 0;
            let automatic = 0;
            data.map((item: any) => {
                if (item.status == "manually") {
                    manually++;
                } else {
                    automatic++;
                }
            })

            const step = 100 / (manually + automatic);
            const post_data = JSON.parse(JSON.stringify(postedData));
            post_data.series[0].data = [
                {
                    name: '',
                    y: step * automatic,
                    color: THEME_COLOR
                },
                {
                    name: '',
                    y: step * manually,
                    color: '#FDBA8C'
                },
            ]

            setPostedData(post_data);
            const total_time = manually * 30 + automatic * 60;
            const hours = Math.floor(total_time / 3600);
            const mins = total_time % 3600 / 60;
            if (total_time == 0) {
                setSavedTime("");
            } else {
                setSavedTime(`${hours} hrs ${mins} mins`)
            }
        } else {

        }
    }

    const getCronStatus = async () => {
        const res = await fetch('/api/train/get_cron_status', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id
            }),
        });
        if (res.status == 200) {
            const data_ = await res.json();
            const status = data_.status;
            if (status != undefined) {
                setCronType(status);
            }
        }
    }

    const getOverview = async () => {
        const res = await fetch('/api/new_comments/get_overview', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
                type: selOverviewFilter.type
            }),
        });
        if (res.status == 200) {
            const _data = await res.json();
            const date: any = [];
            const data: any = [];
            _data.map((item: any) => {
                date.push(item.date);
                data.push(item.count);
            })

            const overview_ = JSON.parse(JSON.stringify(overview));
            overview_.xAxis.categories = date;
            overview_.series[0].data = data
            setOverview(overview_);
        }
    }

    return (
        <Box>
            <Grid>
                <Grid.Col md={6} lg={6} sm={12}>
                    <Box
                        sx={(theme) => ({
                            background: 'white',
                            borderRadius: 16,
                            borderBottom: `1px solid ${isMobile?'white':THEM_BORDER_COLOR}`,
                            border: `1px solid ${THEM_BORDER_COLOR}`
                        })}
                    >
                        <Flex
                            p={15}
                            sx={(theme) => ({
                                borderBottom: '1px solid #E5E7EB'
                            })}
                        >
                            <Text size={20} weight={600} className="headerline" color="#111928">
                                New Comments
                            </Text>
                            <Badge color="orange">
                                {
                                    newCommentsCount
                                }
                            </Badge>
                        </Flex>
                        {
                            loadNewComments ?
                                <Flex
                                    align={'center'}
                                    justify={'center'}
                                    h={360}
                                >
                                    <Loader variant="bars" color={THEME_COLOR} />
                                </Flex> :
                                <ScrollArea
                                    h={360} type="auto" scrollHideDelay={2000}
                                    pt={15} pb={15}
                                    sx={(theme) => ({
                                        borderBottom: '1px solid #E5E7EB'
                                    })}
                                >
                                    <Flex
                                        direction={'column'}
                                        gap={10}
                                        p={15}
                                    >
                                        {
                                            newComments.length == 0 ?
                                                <Text >
                                                    We are waiting for the first comment...
                                                </Text> :
                                                newComments.map((comment, key) =>
                                                    <Flex gap={10} key={key}>
                                                        <Avatar src={comment.picture} />
                                                        <Box>
                                                            <Text size={16} color="#111928" weight={600} className='body-normal'>
                                                                {comment.from_name}
                                                            </Text>
                                                            <Text size={14} color="#18232A" weight={400} >
                                                                {comment.message}
                                                            </Text>
                                                            <Flex gap={5} align={'center'} >
                                                                <IconCalendar color="#637381" size={14} />
                                                                <Text color="#637381" size={12} weight={500} mt={3}>
                                                                    {convertDate(comment.create_time)}
                                                                </Text>
                                                            </Flex>
                                                        </Box>
                                                    </Flex>
                                                )
                                        }
                                    </Flex>
                                </ScrollArea>
                        }

                        <Flex justify={'flex-end'} p={15}>
                            <Link href={`/${brand_name}/comments`}>
                                <Button
                                    variant="outline"
                                    sx={(theme) => ({
                                        border: '1px solid #E0E0497A',
                                        borderRadius: '30px',
                                        color: '#18232A',
                                        fontSize: '14px',
                                    })}
                                    className="transparent-button"
                                >
                                    <Text className="body-normal">See all</Text>
                                </Button>
                            </Link>
                        </Flex>
                    </Box>
                </Grid.Col>
                <Grid.Col md={6} lg={6} sm={12}>
                    <Box
                        sx={(theme) => ({
                            background: 'white',
                            borderRadius: 16,
                            boxShadow: '0px 1px 2px 0px #919EAB3D',
                            border: `1px solid ${THEM_BORDER_COLOR}`

                        })}
                    >
                        <Flex
                            p={15}
                            sx={(theme) => ({
                                borderBottom: `1px solid ${THEM_BORDER_COLOR}`
                            })}
                            justify={'space-between'}
                            align={'center'}
                        >
                            <Text size={20} weight={600} className="headerline">
                                Overview
                            </Text>
                            <Menu openDelay={100} closeDelay={400}>
                                <Menu.Target>
                                    <Button
                                        className='brands overview-button'
                                        sx={(theme) => ({
                                            background: '#ECEDE7',
                                            '&:hover': {
                                                background: '#919EAB3D'
                                            }
                                        })}
                                    >
                                        <Flex align={'center'} gap={10}>
                                            <Text color="#212B36" size={14} weight={400}>
                                                {selOverviewFilter.name}
                                            </Text>
                                            <Image src="/brands_menu_icon.png" alt="ovewview" />
                                        </Flex>
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown className="overview-dropdown">
                                    {
                                        overviewfilters.map((item: any, key: number) =>
                                            <Menu.Item
                                                key={key}
                                                sx={(theme) => ({
                                                    borderBottom: key == overviewfilters.length - 1 ? 'none' : `1px solid ${THEM_SPLITER_COLOR}`
                                                })}
                                                onClick={() => {
                                                    setSelOverviewFilter(item);
                                                }}
                                            >
                                                <Text size={12} color="#637381" weight={500}>{item.name}</Text>
                                            </Menu.Item>
                                        )
                                    }
                                </Menu.Dropdown>
                            </Menu>
                        </Flex>
                        <Box
                            pt={15} pb={15}
                            sx={(theme) => ({
                            })}
                            w={'100%'}
                        >
                            <HighchartsReact highcharts={Highcharts} options={overview} width={'100%'} />
                        </Box>
                    </Box>
                </Grid.Col>
            </Grid>
            <Grid mt={20} gutter={40}>
                <Grid.Col lg={4} md={4} sm={12}>
                    <Box
                        sx={(theme) => ({
                            background: 'white',
                            boxShadow: '0px 1px 2px 0px #919EAB3D',
                            borderRadius: '16px',
                            border: `1px solid ${THEM_BORDER_COLOR}`
                        })}
                    >
                        <Flex
                            p={24}
                            pt={16} pb={16} 
                            sx={(theme) => ({
                                borderBottom: '1px solid #E5E7EB'
                            })}
                        >
                            <Text size={20} className="headerline">
                                Select Mode
                            </Text>
                        </Flex>
                        <Flex
                            pt={15}
                            pb={15}
                            justify={'space-around'}
                            sx={(theme) => ({
                                borderBottom: '1px solid #E5E7EB',
                                background: isMobile?'#F5F4F0':'white'
                            })}
                        >

                            <Text size={18} color={cronType == 'manually' ? '#18232A' : '#919EAB'} className="headerline">
                                Manually
                            </Text>
                            <Switch
                                onLabel="" offLabel="" color="yellow" size="md"
                                checked={cronType == "manually" ? false : true}
                                onChange={(event) => {
                                    const status = event.currentTarget.checked ? "automatic" : 'manually';
                                    setCronType(status)
                                    changeCronType(status)
                                }}
                            />
                            <Text size={18} color={cronType == 'automatic' ? '#18232A' : '#919EAB'} className="headerline">
                                Automatic
                            </Text>
                        </Flex>
                        <Flex
                            gap={0}
                        >
                            <Box
                                p={15}
                                w={'50%'}
                                style={{ fontWeight: 500 }}
                            >
                                <Text color={cronType == 'manually' ? '#18232A' : '#919EAB'}>
                                    {`Manually publish all the comments by choosing them from the ‘Comments' page. Use this option for sending custom messages.`}
                                </Text>
                            </Box>
                            <Box
                                p={15}
                                sx={(theme) => ({
                                    borderLeft: '1px solid #E5E7EB',
                                    fontWeight: 500
                                })}
                                w={'50%'}
                            >
                                <Text color={cronType == 'automatic' ? '#18232A' : '#919EAB'}>
                                    Automatically answers all new comments with our “favorite answer”. Only activate this mode, if you feel confident and if you have trained the AI with enough data.
                                </Text>
                            </Box>
                        </Flex>
                    </Box>
                </Grid.Col>
                <Grid.Col lg={4} md={4} sm={12}>
                    <Box
                        sx={(theme) => ({
                            background: 'white',
                            boxShadow: '0px 1px 2px 0px #919EAB3D',
                            borderRadius: '16px',
                            border: `1px solid ${THEM_BORDER_COLOR}`
                        })}
                    >
                        <Flex
                            p={24}
                            pt={16} pb={16} 
                            sx={(theme) => ({
                                borderBottom: '1px solid #E5E7EB'
                            })}
                        >
                            <Text size={20} className="headerline">
                                Time Saved
                            </Text>
                        </Flex>
                        <Flex mt={15} align={'center'} justify={'center'} w={'100%'} direction={'column'} p={20}>
                            <Flex
                                p={10}
                                sx={(theme) => ({
                                    borderRadius: 16,
                                })}
                                bg={'#ECEDE7'}
                                justify={'center'}
                                direction={'column'}
                                align={'center'}
                            >
                                {
                                    savedTime == "" ? <Box>
                                        <Text color="#18232A" weight={'bold'} size={20}>
                                            No Data
                                        </Text>
                                        <Text size={14} sx={(theme) => ({ letterSpacing: 1 })}>
                                            waiting for data
                                        </Text>
                                    </Box> :
                                        <Box>
                                            <Text color="#18232A" weight={'bold'} size={20} className="headerline">
                                                {
                                                    savedTime
                                                }
                                            </Text>
                                            <Text size={14} sx={(theme) => ({ letterSpacing: 1 })}>
                                                since using replient
                                            </Text>
                                        </Box>
                                }
                            </Flex>
                            {
                                savedTime == "" ? <></> :
                                    <Box w={'100%'}>
                                        <Flex justify={'center'} align={'center'} className='ring-progress'>
                                            <HighchartsReact highcharts={Highcharts} options={postedData} />
                                        </Flex>
                                        <Flex w={'100%'} align={'center'} justify={'center'} gap={5} mt={-20} style={{ position: 'relative', top: '-50px' }}>
                                            <Box
                                                sx={(theme) => ({
                                                    width: 12,
                                                    height: 12,
                                                    background: THEME_COLOR,
                                                    borderRadius: 12
                                                })}
                                            >

                                            </Box>
                                            <Text size={12} color="#6B7280" >
                                                Automatic
                                            </Text>
                                            <Box
                                                sx={(theme) => ({
                                                    width: 12,
                                                    height: 12,
                                                    background: '#FDBA8C',
                                                    borderRadius: 12
                                                })}
                                            >

                                            </Box>
                                            <Text size={12} color="#6B7280">
                                                Manually
                                            </Text>
                                        </Flex>
                                    </Box>
                            }
                        </Flex>
                    </Box>
                </Grid.Col>
                <Grid.Col lg={4} md={4} sm={12}>
                    <Box
                        sx={(theme) => ({
                            background: 'white',
                            boxShadow: '0px 1px 2px 0px #919EAB3D',
                            borderRadius: '16px',
                            border: `1px solid ${THEM_BORDER_COLOR}`
                        })}
                    >
                        <Flex
                            p={24}
                            pt={16} pb={16} 
                            sx={(theme) => ({
                                borderBottom: '1px solid #E5E7EB',
                            })}
                        >
                            <Text size={20} className="headerline">
                                Connected Source
                            </Text>
                        </Flex>
                        <Box mt={15} p={16}>
                            <Flex gap={20} direction={'column'}>
                                <Flex justify={"space-between"} align={'center'}>
                                    <Flex align={'center'} w={'100%'} gap={5}>
                                        <FaFacebook color="#1877F2" size={26}/>
                                        <Text color="#18232A" size={16} weight={600}>
                                            Facebook page
                                        </Text>
                                    </Flex>
                                    <Text color={
                                        socialsConnectStatus.filter(item => item.type == "fb").length > 0 ? '#00AB55' : '#CD486B'
                                    }
                                        size={'14px'} weight={600}>
                                        {socialsConnectStatus.filter(item => item.type == "fb").length > 0 ? 'Connected' : 'Disconnected'}
                                    </Text>
                                </Flex>
                                <Flex justify={"space-between"} align={'center'}>
                                    <Flex align={'center'} w={'100%'} gap={5}>
                                        <FaInstagram color="#E02D69" size={26}/>
                                        <Flex direction={'column'}>
                                            <Text color="#18232A" size={16} weight={600}>
                                                Instagram
                                            </Text>
                                            <Text color="#637381" size={14}>
                                                {}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                    <Text color={
                                        socialsConnectStatus.filter(item => item.type == "ig").length > 0 ?
                                            socialsConnectStatus.filter(item => item.type == "ig")[0].connected?
                                            '#00AB55' : '#CD486B'
                                        :'#CD486B'
                                    }
                                        size={'14px'} weight={600}>
                                        {socialsConnectStatus.filter(item => item.type == "ig").length > 0 ? 'Connected' : 'Disconnected'}
                                    </Text>
                                </Flex>
                            </Flex>
                        </Box>
                    </Box>
                </Grid.Col>
            </Grid>
        </Box>
    )
}

export default Dashboard;