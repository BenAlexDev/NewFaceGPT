import { THEME_COLOR, THEM_SPLITER_COLOR } from "@/utils/app/consts";
import { toNormalizedUrl } from "@/utils/app/helper";
import { addSource, fetchSitemaps, train } from "@/utils/app/train";
import { Box, Button, Flex, LoadingOverlay, Progress, Slider, Table, Text, TextInput, UnstyledButton } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { FaRegWindowClose, FaWindowClose } from "react-icons/fa";
import { toNormalizedOrigin } from '../../utils/app/helper';
import { Source, SourceState } from "@/types/train";
import { deleteSelectedFiles } from '../../utils/app/train';
import { notifications } from "@mantine/notifications";

interface Props {
    nextStep: () => void;
    prevStep: () => void;
    brand_id: string
}

interface AddedSites {
    url: string,
    state: string,
    added_date: string,
    progress: number,
    source: Source
}

let trainedCount: number = 0;
let totalTrainPageUrl: number = 0;

const SiteBoard: FC<Props> = ({
    nextStep,
    prevStep,
    brand_id
}) => {

    const [addedSites, setAddedSites] = useState<AddedSites[]>([]);
    const [progress, setPropgress] = useState<number>(0);
    const [selSource, setSelSource] = useState<Source>(SourceState);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
    }, [])

    const AddSites = () => {
        setAddedSites(p => [...p, { url: '', state: 'no_trained', added_date: '', progress: 0, source: SourceState }]);
    }

    const trainSites = async (index: number) => {

        try {
            totalTrainPageUrl = 0;
            trainedCount = 0;

            const sitepath = addedSites[index].url;
            let url = sitepath;
            if (sitepath.indexOf("http") == -1) {
                const baseUrl = toNormalizedUrl(sitepath);
                url = toNormalizedOrigin(baseUrl);
            }
            
            if (url[url.length - 1] != "/") {
                url += '/';
            }
            let page_urls: any = false;
            while (!page_urls) {
                page_urls = await fetchSitemaps(url);
            }
            if (page_urls.length == 0) {
                notifications.show({
                    message: `Didn't get page urls`,
                    color: 'red'
                })
                return;
            }

            const _added_sites: AddedSites[] = JSON.parse(JSON.stringify(addedSites));
            _added_sites[index].state = 'training';
            _added_sites[index].progress = 0;
            const added_source = await addSource(brand_id, url, 'websites', "0");
            _added_sites[index].source = added_source.source;
            const source = added_source.source;
            setPropgress(0);
            setAddedSites(_added_sites);

            totalTrainPageUrl = page_urls.length;
            let promises: Promise<any>[] = [];
            setSelSource(source);

            page_urls.map((page_url: any) => {
                console.log(page_url);
                promises.push(fetchURLToText(page_url, source.id));
            });

            let responses = await Promise.all(promises);
            _added_sites[index].state = 'trained';
            setAddedSites(_added_sites);
            notifications.show({
                message: 'success',
            })
        } catch (e) {
            notifications.show({
                message: 'failed',
                color: 'red'
            })
        }
    }

    useEffect(() => {
        getFiles();
    }, [])
    
    const getFiles = async () => {
        setIsLoading(true);
        const res = await fetch('/api/train/get_sources', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
            })
        })
        if (res.status == 200) {
            const sites: AddedSites[] = [];
            const data = await res.json();
            data.map((item: any) => {
                if (item.type == "websites") {
                    sites.push({
                        url: item.path,
                        progress: 100,
                        state: "trained",
                        source: item,
                        added_date: item.created_time,

                    })
                }
            })
            console.log(sites);
            setAddedSites(sites)
        }
        setIsLoading(false);
    }

    const fetchURLToText = async (url: string, source_id: string) => {
        const fetchPageRes = await fetch("/api/train/fetch_page", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: url,
            }),
        });

        if (fetchPageRes.status == 200) {
            const data = await fetchPageRes.json();
            const text = data.text;

            if (text != "") {
                const res = await train(text, brand_id, source_id, url, "websites");
                if (res.status == 200) {
                    trainedCount++;
                    setPropgress(
                        Math.ceil((trainedCount / totalTrainPageUrl) * 100)
                    );
                }
            }
        }
    }

    const stopTraining = async (index: number) => {
        const _added_sites: AddedSites[] = JSON.parse(JSON.stringify(addedSites));
        _added_sites[index].state = 'not_trained';
        setAddedSites(_added_sites);
        await deleteFiles(_added_sites[index].source.id);
    }

    const deleteFiles = async (source_id: string) => {
        const res = await fetch('/api/train/delete_source_path', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: source_id,
            }),
        })
        if (res.status == 200) {

        } else {
            console.log(res);
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
                        borderBottom: '1px solid #E5E7EB'
                    }}
                    pl={20}
                >
                    <Text weight={'bold'} size={'20px'} className="headerline"
                    >
                        Add Domains
                    </Text>
                </Box>
                <Box p={15}>
                    <Flex
                        direction={'column'}
                        gap={'15px'}
                    >
                        {
                            addedSites.map((item, key) =>
                                <Flex gap={10} key={key} justify={'space-between'}>
                                    <Text color="16px" weight={600} pt={5}>
                                        {key + 1}.
                                    </Text>
                                    <Flex
                                        gap={5}
                                    >

                                        <Flex
                                            style={{
                                                width: '950px'
                                            }}

                                            direction={'column'} gap={10}>
                                            <TextInput
                                                style={{
                                                    width: '100%'
                                                }}
                                                onChange={(event) => {
                                                    const value = event.currentTarget.value;
                                                    const _added_sites: AddedSites[] = JSON.parse(JSON.stringify(addedSites));
                                                    _added_sites[key].url = value;
                                                    setAddedSites(_added_sites);
                                                }}
                                                className="sitemap-input"
                                                rightSection={
                                                    item.state == "traned" ?
                                                        <Flex
                                                            pl={25}
                                                            pr={25}
                                                            align={'center'}
                                                            justify={'center'}
                                                            sx={(theme) => ({
                                                                borderLeft: `1px solid ${THEM_SPLITER_COLOR}`
                                                            })}
                                                            w={'100%'}
                                                            gap={10}
                                                        >
                                                            <Text color="#919EAB" size={12} weight={500}>
                                                                Added:
                                                            </Text>
                                                            <Text color="#18232A" size={12} weight={500}>
                                                                Feb 28, 2023
                                                            </Text>
                                                        </Flex> : <></>
                                                }
                                                value={item.url}
                                            />
                                            {
                                                item.state == "training" ?
                                                    <Progress value={progress} color={THEME_COLOR} /> : <></>
                                            }
                                        </Flex>
                                    </Flex>
                                    <Flex
                                        direction={'column'}
                                        gap={5}
                                    >
                                        {
                                            item.state == "no_trained" ?
                                                <Button
                                                    radius={30}
                                                    bg={THEME_COLOR}
                                                    sx={(theme) => ({
                                                        '&:hover': {
                                                            background: THEME_COLOR
                                                        },
                                                        background: `${THEME_COLOR} !important`,
                                                        paddingLeft: '10px',
                                                        paddingRight: '10px'

                                                    })}
                                                    disabled={
                                                        addedSites.filter((item: AddedSites) => item.state == 'training').length > 0 ? true : false
                                                    }
                                                >
                                                    <Text color="black" className="body-normal" size={14} onClick={() => {
                                                        trainSites(key);
                                                    }}>
                                                        Connect
                                                    </Text>
                                                </Button> :
                                                <Button
                                                    variant="outline"
                                                    sx={(theme) => ({
                                                        borderColor: THEME_COLOR,
                                                        paddingLeft: '10px',
                                                        paddingRight: '10px'
                                                    })}
                                                    radius={30}
                                                    onClick={() => {
                                                        stopTraining(key);
                                                        setAddedSites(p => p.splice(key, 1));
                                                    }}
                                                    disabled={item.state == "training" ? true : false}
                                                    className="transparent-button"
                                                >
                                                    <Text color="black" className="body-normal">
                                                        Delete
                                                    </Text>
                                                </Button>
                                        }
                                        {
                                            item.state == "training" ?
                                                <Flex justify={'center'} gap={5}>
                                                    <Text size={12} color="#637381">
                                                        {progress}%
                                                    </Text>
                                                    <Box>
                                                        <FaRegWindowClose
                                                            style={{ color: '#637381', cursor: 'pointer' }}
                                                            onClick={() => { stopTraining(key) }}
                                                        />
                                                    </Box>
                                                </Flex> : <></>
                                        }
                                    </Flex>
                                </Flex>
                            )
                        }
                    </Flex>
                    <UnstyledButton
                        onClick={() => { AddSites() }}
                        mt={15}
                        mb={15}
                    >
                        <Flex align={'center'} gap={10} sx={(theme) => ({
                            cursor: 'pointer'
                        })}
                        >
                            <IconPlus color="#18232A" size={25} />
                            <Text color="#18232A" size={14}>
                                Add another sitemap
                            </Text>
                        </Flex>
                    </UnstyledButton>
                    <Flex
                        justify={'space-between'}
                        w={'100%'}
                        pt={15}
                        mb={0}
                        sx={(theme) => ({
                            borderTop: '1px solid #E5E7EB'
                        })}
                    >
                        <Button variant="outline"
                            sx={(theme) => ({
                                borderColor: THEME_COLOR
                            })}
                            radius={30}
                            onClick={() => { prevStep() }}
                            className="transparent-button"
                        >
                            <Text color="black" className="body-normal">
                                Back
                            </Text>
                        </Button>
                        <Flex align={'center'}
                            gap={10}
                        >
                            <Text
                                weight={600}
                                size={14}
                                sx={(theme) => ({
                                    cursor: 'pointer'
                                })}
                                onClick={() => { nextStep() }}
                                className="body-normal"
                            >
                                Skip
                            </Text>
                            <Button
                                radius={30}
                                bg={THEME_COLOR}
                                sx={(theme) => ({
                                    '&:hover': {
                                        background: THEME_COLOR
                                    }
                                })}
                                className="button-background"
                            >
                                <Text color="black" size={14} onClick={() => { nextStep() }} className="body-normal">
                                    Continue
                                </Text>
                            </Button>
                        </Flex>
                    </Flex>
                </Box>
                <LoadingOverlay className="overloader" visible={isLoading} />
            </Box>
        </Flex>
    )
}

export default SiteBoard;