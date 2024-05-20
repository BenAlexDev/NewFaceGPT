import { Box, Button, Flex, Loader, LoadingOverlay, Stepper, Table, Text, TextInput } from "@mantine/core";
import { FC, useEffect, useState, useContext } from "react";
import { useRouter } from 'next/router';
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_BORDER_COLOR, THEM_SPLITER_COLOR } from "@/utils/app/consts";
import { IconCheck, IconFile, IconMessage2, IconMessages, IconPlus, IconUsersGroup, IconWorld } from "@tabler/icons-react";
import { Source } from "@/types/train";
import { convertDate } from '../../../utils/app/global';
import TestingModal from "./TestingModal";
import Link from "next/link";
import HomeContext from "@/state/index.context";
import { useMediaQuery } from '@mantine/hooks';
import { FiTrash2 } from "react-icons/fi";
interface Props {
    brand_name: string | string[] | undefined,
    brand_id: string,
}

const Learning: FC<Props> = ({
    brand_name,
    brand_id
}) => {
    const [socials, setSocials] = useState<Source[]>([]);
    const [files, setFiles] = useState<Source[]>([]);
    const [sites, setSites] = useState<Source[]>([]);
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const [openTestingModal, setOpenTestingModal] = useState<boolean>(false);
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);

    const {
        state: { deleted_source_id },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    useEffect(() => {
        getSouces();
    }, [brand_id]);

    const getSouces = async () => {
        setIsLoad(true);
        const res = await fetch('/api/train/get_sources', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
            }),
        })
        if (res.status == 200) {
            const data = await res.json();
            const _socials: Source[] = [];
            const _files: Source[] = [];
            const _sites: Source[] = [];
            data.map((item: Source) => {
                if ((item.type != "files" && item.type != "websites") && item.connected) {
                    _socials.push(item);
                } else if (item.type == "files") {
                    _files.push(item);
                } else if (item.type == "websites") {
                    _sites.push(item);
                }
            })
            setSocials(_socials); setFiles(_files); setSites(_sites);
        } else {

        }
        setIsLoad(false);
    }

    const deleteSource = async (source_id: string, type?: string) => {
        setIsLoad(true);
        const res = await fetch('/api/train/delete_source_path', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: source_id,
                brand_id,
                type
            }),
        });
        if (res.status == 200) {
            getSouces();
            homeDispatch({
                "field": 'deleted_source_id',
                "value": source_id
            })
        }
        setIsLoad(false);
    }

    const renderSocialForm = (item: Source) => {
        let type = "";
        if (item.type == "fb") {
            type = 'Facebook';
        } else if (item.type == 'ig') {
            type = 'Instagram';
        }
        return `${type}- ${item.page_name}(${item.page_id}`
    }
    
    return (
        <Box
            w='100%'
            h='100%'
            bg='white'
            p={isMobile ? '0px' : '15px'}
            sx={(theme) => ({
                boxShadow: '0px 1px 2px 0px #919EAB3D',
                borderRadius: '10px'
            })}
        >
            <Flex align={'flex-start'} justify={'flex-start'} direction={'column'} w={'100%'} className="learning-page">
                <Box>
                    <Text size={24} className="headerline">
                        Learning
                    </Text>
                    <Text size={16} weight={400} color='#637381'>
                        All the added resources are listed here.
                    </Text>
                </Box>
                <Box mt={30} w={'100%'}>
                    <Flex gap={5}>

                        <Text size={18} color="#18232A" className="headerline">
                            Brand:
                        </Text>
                        <Text size={18} color="#18232A" weight={400} ml={20}>
                            {brand_name}
                        </Text>
                    </Flex>
                    <Flex
                        gap={30}
                        direction={'column'}
                        w='100%'
                        mt={30}
                    >
                        <Box
                            sx={(theme) => ({
                                border: `1px solid ${THEM_BORDER_COLOR}`,
                                borderRadius: 10,
                                padding: 15
                            })}
                            w={'100%'}
                        >
                            <Flex gap={10} >
                                <IconUsersGroup color={THEME_COLOR} fontWeight={700} />
                                <Text size={16} weight={700} >
                                    Social channels
                                </Text>
                            </Flex>
                            <Flex
                                mt={20}
                                gap={15}
                                direction={'column'}
                            >
                                {socials.length == 0 ? <Flex align={'center'} justify={'center'} w={'100%'}>
                                    <h4>No added socials</h4>
                                </Flex> :
                                    socials.map((item: Source, key) =>
                                        <Table key={key}>
                                            <tbody>
                                                <td style={{ padding: 5 }}>{key + 1}.</td>
                                                <td width={'100%'}>
                                                    <TextInput
                                                        value={`${renderSocialForm(item)})`}
                                                        rightSection={
                                                            isMobile ? <></> :
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
                                                                        {
                                                                            convertDate(item.created_time)
                                                                        }
                                                                    </Text>
                                                                    <Flex
                                                                        align={'center'}
                                                                        w={16}
                                                                        h={16}

                                                                        sx={(theme) => ({
                                                                            background: THEME_COLOR,
                                                                            borderRadius: 16
                                                                        })}
                                                                    >
                                                                        <IconCheck color="white" />
                                                                    </Flex>
                                                                </Flex>
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <Box pl={10}>
                                                        <Button
                                                            variant={'outline'}
                                                            sx={(theme) => ({
                                                                border: `1px solid ${THEME_COLOR}`
                                                            })}
                                                            radius={isMobile ? 10 : 32}
                                                            onClick={() => {
                                                                deleteSource(item.id, item.type)
                                                            }}
                                                            className="transparent-button"
                                                        >
                                                            {
                                                                isMobile ?
                                                                    <FiTrash2 color='#18232A' size='20px' weight='bold' /> :
                                                                    <Text color="#18232A" weight={500} className="body-normal">
                                                                        Delete
                                                                    </Text>
                                                            }
                                                        </Button>
                                                    </Box>
                                                </td>
                                            </tbody>
                                        </Table>
                                    )
                                }

                            </Flex>
                        </Box>
                        <Box
                            sx={(theme) => ({
                                border: `1px solid ${THEM_BORDER_COLOR}`,
                                borderRadius: 10,
                                padding: 15
                            })}
                            w={'100%'}
                        >
                            <Flex gap={10} >
                                <IconWorld color={THEME_COLOR} fontWeight={700} />
                                <Text size={16} weight={700}>
                                    Websites
                                </Text>
                            </Flex>
                            <Flex
                                mt={20}
                                gap={15}
                                direction={'column'}
                            >
                                {sites.length == 0 ? <Flex align={'center'} justify={'center'} w={'100%'}>
                                    <h4>No added websites</h4>
                                </Flex> :
                                    sites.map((item, key) =>
                                        <Table key={key}>
                                            <tbody>
                                                <td style={{ padding: 5 }}>{key + 1}.</td>
                                                <td width={'100%'}>
                                                    <TextInput
                                                        value={item.path}
                                                        rightSection={
                                                            isMobile ? <></> :
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
                                                                        {
                                                                            convertDate(item.created_time)
                                                                        }
                                                                    </Text>
                                                                    <Flex
                                                                        align={'center'}
                                                                        w={16}
                                                                        h={16}

                                                                        sx={(theme) => ({
                                                                            background: THEME_COLOR,
                                                                            borderRadius: 16
                                                                        })}
                                                                    >
                                                                        <IconCheck color="white" />
                                                                    </Flex>
                                                                </Flex>
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <Box pl={10}>
                                                        <Button
                                                            variant={'outline'}
                                                            sx={(theme) => ({
                                                                border: `1px solid ${THEME_COLOR}`
                                                            })}
                                                            radius={isMobile ? 10 : 32}
                                                            onClick={() => {
                                                                deleteSource(item.id)
                                                            }}
                                                            className="transparent-button"
                                                        >
                                                            {
                                                                isMobile ?
                                                                    <FiTrash2 color='#18232A' size='20px' weight='bold' /> :
                                                                    <Text color="#18232A" weight={500} className="body-normal">
                                                                        Delete
                                                                    </Text>
                                                            }
                                                        </Button>
                                                    </Box>
                                                </td>
                                            </tbody>
                                        </Table>
                                    )
                                }

                            </Flex>
                        </Box>
                        <Box
                            sx={(theme) => ({
                                border: `1px solid ${THEM_BORDER_COLOR}`,
                                borderRadius: 10,
                                padding: 15
                            })}
                            w={'100%'}
                        >
                            <Flex gap={10} >
                                <IconFile color={THEME_COLOR} fontWeight={700} />
                                <Text size={16} weight={700}>
                                    Added Files
                                </Text>
                            </Flex>
                            <Flex
                                mt={20}
                                gap={15}
                                direction={'column'}
                            >
                                {
                                    files.length == 0 ? <Flex align={'center'} justify={'center'} w={'100%'}>
                                        <h4>No added files</h4>
                                    </Flex> :
                                        files.map((item, key) =>
                                            <Table key={key}>
                                                <tbody>
                                                    <td style={{ padding: 5 }}>{key + 1}</td>
                                                    <td width={'100%'}>
                                                        <TextInput
                                                            value={item.path}
                                                            rightSection={
                                                                isMobile ? <></> :
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
                                                                            {
                                                                                convertDate(item.created_time)
                                                                            }
                                                                        </Text>
                                                                        <Flex
                                                                            align={'center'}
                                                                            w={16}
                                                                            h={16}

                                                                            sx={(theme) => ({
                                                                                background: THEME_COLOR,
                                                                                borderRadius: 16
                                                                            })}
                                                                        >
                                                                            <IconCheck color="white" />
                                                                        </Flex>
                                                                    </Flex>
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <Box pl={10}>
                                                            <Button
                                                                variant={'outline'}
                                                                sx={(theme) => ({
                                                                    border: `1px solid ${THEME_COLOR}`
                                                                })}
                                                                radius={isMobile ? 10 : 32}
                                                                onClick={() => {
                                                                    deleteSource(item.id)
                                                                }}
                                                                className="transparent-button"
                                                            >
                                                                {
                                                                    isMobile ?
                                                                        <FiTrash2 color='#18232A' size='20px' weight='bold' /> :
                                                                        <Text color="#18232A" weight={500} className="body-normal">
                                                                            Delete
                                                                        </Text>
                                                                }
                                                            </Button>
                                                        </Box>
                                                    </td>
                                                </tbody>
                                            </Table>
                                        )
                                }
                            </Flex>
                        </Box>
                    </Flex>
                </Box>
                <Flex
                    direction={isMobile ? 'column' : 'row'}
                    mt={30}
                    justify={'flex-end'}
                    gap={15}
                    w={'100%'}>
                    <Button
                        leftIcon={
                            <IconMessages color="#1F2A37" size={14} />
                        }
                        variant="outline"
                        fullWidth={isMobile ? true : false}
                        sx={(theme) => ({
                            border: `1px solid ${THEM_BORDER_COLOR}`
                        })}
                        radius={30}
                        onClick={() => {
                            setOpenTestingModal(true);
                        }}
                        className="transparent-button"
                    >
                        <Text weight={600} color="#1F2A37" >
                            Manual Testing
                        </Text>
                    </Button>
                    <Link href={`/onboarding/${brand_name}`}>
                        <Button
                            leftIcon={
                                <IconPlus color="#1F2A37" />
                            }
                            variant="outline"
                            sx={(theme) => ({
                                border: `1px solid ${THEME_COLOR}`,
                                background: `${THEME_COLOR} !important`,
                            })}
                            fullWidth={isMobile ? true : false}
                            radius={30}
                        >
                            <Text weight={600} color="#1F2A37" className="body-normal">
                                Add additional sources
                            </Text>
                        </Button>
                    </Link>

                </Flex>
            </Flex>
            <LoadingOverlay color={THEME_COLOR} visible={isLoad} className='overloader' />
            <TestingModal
                open={openTestingModal}
                close={() => {
                    setOpenTestingModal(false);
                }}
                brand_id={brand_id}
            />
        </Box>
    )
}



export default Learning;