import { THEME_COLOR, THEM_BORDER_COLOR } from '@/utils/app/consts';
import { Menu, Text, Table, Flex, Checkbox, Box, LoadingOverlay, Image, Avatar } from '@mantine/core';
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/app/supabase-client';
import HomeContext from "@/state/index.context";
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { Source } from '@/types/train';

const ManageBrands = () => {

    const router = useRouter();
    const [brandData, setBrandData] = useState<any>([]);
    const [isLoad, setIsLoad] = useState<boolean>(false);
    
    const {
        state: { deleted_brand_id },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    useEffect(() => {
        getBrandsData();
    }, [])

    const getBrandsData = async () => {
        setIsLoad(true);
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch('/api/settings/get_brands', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: session?.user?.id,
            }),
        })
        if (res.status == 200) {
            const data = await res.json();
            setBrandData(data)
        }
        setIsLoad(false);
    }

    const deleteBrand = async (brand_ids: string[]) => {
        setIsLoad(true);
        try {
            const res = await fetch('/api/brands/delete_brand', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    brand_ids
                }),
            })
            if (res.status == 200) {
                getBrandsData();
                homeDispatch({
                    "field":"deleted_brand_id",
                    "value":brand_ids[0]
                })
            }
        } catch (e) {

        }   
        setIsLoad(false);
    }

    const unSubscribeBrand = () => {
        
    }

    const setAllChecked = (checked: boolean) => {
        const brand_data = JSON.parse(JSON.stringify(brandData));
        brand_data.map((item: any) => {
            item.checked = checked
        })
        setBrandData(brand_data);
    }

    const renderIcons = (source:Source) => {
        if(source.type == "fb") {
            return <FaFacebook size="20px" color="#1877F2"/>
        } else if(source.type == 'ig') {
            return <FaInstagram size="20px" color="#E02D69"/>
        } else {
            return <></>
        }
    }

    return (
        <Box
            sx={(theme) => ({
                border: `1px solid ${THEM_BORDER_COLOR
                    }`,
                borderRadius: '16px',
                boxShadow: '0px 1px 2px 0px rgba(145, 158, 171, 0.24)'
            })}
            mt={20}
        >
            <Flex justify={'space-between'} p={16} align={'center'}>
                <Text size={24}  className="headerline">
                    Add/Remove Brands
                </Text>
                <Flex justify={'center'} align={'center'} gap={20} pr={20}>
                    <IconPlus color='#6B7280' cursor={'pointer'} onClick={() => { router.push("/onboarding") }} />
                    <IconTrash color='#6B7280' cursor={'pointer'}
                        onClick={() => {
                            const brand_ids: string[] = [];
                            brandData.map((item: any) => {
                                if (item.checked) {
                                    brand_ids.push(item.id);
                                }
                            })
                            deleteBrand(brand_ids);
                        }}
                    />
                </Flex>
            </Flex>
            <Box
               
            >   
                <Table>
                    <thead>
                        <tr style={{ background: '#ECEDE7' }}>
                            <td width={'5%'}>
                                <Flex justify={'center'} pt={10} pb={10}>
                                    <Checkbox
                                        onClick={(event) => {
                                            setAllChecked(event.currentTarget.checked);
                                        }}
                                    />
                                </Flex>
                            </td>
                            <td>
                                <Text color='#637381' size={14} weight={600}>
                                    Brand
                                </Text>
                            </td>
                            <td>
                                <Text color='#637381' size={14} weight={600}>
                                    Category
                                </Text>
                            </td>
                            <td>
                                <Text color='#637381' size={14} weight={600}>
                                    Social Channels
                                </Text>
                            </td>
                            <td>
                                <Text color='#637381' size={14} weight={600}>
                                    Websites added
                                </Text>
                            </td>
                            <td>
                                <Text color='#637381' size={14} weight={600}>
                                    Files added
                                </Text>
                            </td>
                            <td>

                            </td>
                        </tr>
                    </thead>
                    <tbody
                        // style={{borderBottom: `1px solid ${THEM_BORDER_COLOR}`}}
                    >
                        {
                            brandData.length == 0?<tr><td colSpan={6} align='center'>No brands. Please add a new brands.</td></tr>:
                            brandData.map((item: any, key: number) =>
                                <tr key={key} style={{paddingTop: '10px', paddingBottom: '10px', border: 'none'}}>
                                    <td>
                                        <Flex justify={'center'}>
                                            <Checkbox
                                                style={{
                                                    background: THEME_COLOR
                                                }}
                                                checked={item.checked}
                                                onClick={(event) => {
                                                    const brand_data = JSON.parse(JSON.stringify(brandData));
                                                    brand_data[key].checked = event.currentTarget.checked;
                                                    setBrandData(brand_data);
                                                }}
                                            />
                                        </Flex>
                                    </td>
                                    <td>
                                        <Text size={14} color='#212B36' weight={400}>{item.name}</Text>
                                    </td>
                                    <td>
                                        <Text></Text>
                                    </td>
                                    <td>
                                        <Avatar.Group spacing='sm'>
                                        {
                                            // item.sources.filter((item: any) => item.type == "fb").length > 0 ?
                                            //     <FaFacebook size='20px' color='#1877F2'/> : <></>
                                            item.sources.map((item:Source) => 
                                                renderIcons(item)
                                            )
                                        }
                                        </Avatar.Group>
                                    </td>
                                    <td>
                                        <Text>
                                            {
                                                item.sources.filter((item: any) => item.type == "websites").length
                                            }
                                        </Text>
                                    </td>
                                    <td>
                                        <Text>
                                            {
                                                item.sources.filter((item: any) => item.type == "files").length
                                            }
                                        </Text>
                                    </td>
                                    <td>
                                        <Menu openDelay={100} closeDelay={400} >
                                            <Menu.Target>
                                                <IconDotsVertical color='#637381' cursor={'pointer'} />
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Link href={`/${item.name}/learning`}>
                                                    <Menu.Item icon={<IconPencil color='#6B7280' size={18} />}>
                                                        <Text size={14} weight={500} color='#6B7280'>Edit</Text>
                                                    </Menu.Item>
                                                </Link>

                                                <Menu.Item icon={<IconTrash color='#6B7280' size={18} />} onClick={() => {
                                                    deleteBrand([item.id])
                                                }}>
                                                    <Text color='#6B7280' size={14} weight={500}>Delete</Text>
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </Table>
                {/* <Flex p={'10px'} justify={'flex-end'} align={'center'}>
                    <Flex align={'center'} gap={32}>
                        <Text>
                            Rows per page:
                        </Text>
                        <Text>
                            123
                        </Text>
                    </Flex>
                </Flex>
                 */}
                <LoadingOverlay visible={isLoad} className='overloader' />
            </Box>
        </Box>
    )
}

export default ManageBrands;