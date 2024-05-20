import { Box, Flex, Select, Tabs, Text } from '@mantine/core';
import { IconKey, IconPhotoEdit, IconPlus, IconUser } from '@tabler/icons-react';
import { FC, useState } from 'react';
import ManageBrands from '@/components/Pages/Settings/ManageBrands';
import Account from '@/components/Pages/Settings/Account';
import MainLayout from '../../components/Layouts/Main/Index';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MODE_SIZE, THEM_BORDER_COLOR } from '@/utils/app/consts';
import { IoSettingsOutline } from 'react-icons/io5';
import { BiSolidUserRectangle } from "react-icons/bi"
import { MdEditDocument } from "react-icons/md";
interface Props {
    brand_id: string,
    brand_name: string | string[] | undefined
}

const Settings: FC<Props> = ({
    brand_id,
    brand_name
}) => {
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
    const [active, setActive] = useState<string>('account');
    const renderSubtitle = () => {
        if (active == 'account') {
            return 'Edit your profile now.';
        } else if (active == "brands") {
            return 'Follow the steps and get tasks done';
        }
    }

    const renderChildren = () => {
        if (active == 'account') {
            return <Account />
        } else if (active == 'brands') {
            return <ManageBrands />
        }
    }

    const renderSelectIcon = () => {
        if(active == 'account'){
            return <BiSolidUserRectangle size="1.2rem" color={'black'} />
        } else if(active == 'billing') {    
            return <MdEditDocument size="1.2rem" color={'black'} />;
        } else if(active == 'brands') {
            return <IconPlus size="1.2rem" color={'black'} />
        }
    }
    
    return (
        <Box>
            <MainLayout
                page_name={'settings'}
            >
                <Box
                    w={'100%'}
                    h={'100%'}
                    bg={'white'}
                    p={15}
                    className='setting-page'
                    sx={(theme) => ({
                        boxShadow: '0px 1px 2px 0px #919EAB3D',
                        borderRadius: '10px'
                    })}
                >
                    <Box>
                        <Flex gap={8} align={'center'}>
                            <IoSettingsOutline size={24} className='block md:hidden lg:hidden' />
                            <Text size={24} className='headerline'>
                                Settings
                            </Text>
                        </Flex>
                        {
                            !isMobile ?
                                <Text size={16} color='#637381'>
                                    {
                                        renderSubtitle()
                                    }
                                </Text> : <></>
                        }
                    </Box>
                    <Box mt={24}>
                        {
                            !isMobile ?
                                <Tabs defaultValue="account" className='settings-tabs'>
                                    <Tabs.List>
                                        <Tabs.Tab value="account"
                                            icon={<BiSolidUserRectangle size="1.2rem" color={active != "account" ? 'rgba(99, 115, 129, 1)' : 'black'} />}
                                            onClick={() => { setActive('account') }}>
                                            <Text className='body-normal' color={active != "account" ? 'rgba(99, 115, 129, 1)' : 'black'}>
                                                Account
                                            </Text>
                                        </Tabs.Tab>
                                        {/* <Tabs.Tab value="password"
                                    icon={<IconKey size="1.2rem" color={active != "password" ? 'rgba(99, 115, 129, 1)' : 'black'} />}
                                    onClick={() => { setActive('password') }}
                                >
                                    <Text className='body-normal' color={active != "password" ? 'rgba(99, 115, 129, 1)' : 'black'}>
                                        Password
                                    </Text>
                                </Tabs.Tab> */}
                                        <Tabs.Tab value="billing"
                                            icon={<MdEditDocument size="1.2rem" color={active != "password" ? 'rgba(99, 115, 129, 1)' : 'black'} />}
                                            onClick={() => { setActive('billing') }}
                                        >
                                            <Text className='body-normal' color={active != "billing" ? 'rgba(99, 115, 129, 1)' : 'black'}>
                                                Billing
                                            </Text>
                                        </Tabs.Tab>
                                        <Tabs.Tab value="manage-brands"
                                            icon={<IconPlus size="1.2rem" color={active != "brands" ? 'rgba(99, 115, 129, 1)' : 'black'} />}
                                            onClick={() => { setActive('brands') }}
                                        >
                                            <Text className='body-normal' color={active != "brands" ? 'rgba(99, 115, 129, 1)' : 'black'}>
                                                Manage Brands
                                            </Text>
                                        </Tabs.Tab>
                                    </Tabs.List>
                                </Tabs> :
                                <Box>
                                    <Select
                                        data={[
                                            {   value: 'account', 
                                                label: 'Account',
                                            },
                                            { value: 'billing', label: 'Billing' },
                                            { value: 'brands', label: 'Manage Brands' },
                                        ]}
                                        onChange={(value_: string) => {
                                            setActive(value_)
                                        }}
                                        icon={renderSelectIcon()}
                                        value={active}
                                    >

                                    </Select>
                                </Box>
                        }
                        <Box
                            sx={(theme) =>({
                                border: `1px solid ${isMobile?THEM_BORDER_COLOR:'white'}`,
                                borderRadius: '16px'
                            })}
                            pt={20}
                            mt={24}
                        >
                            {
                                renderChildren()
                            }
                        </Box>
                    </Box>
                </Box>
            </MainLayout>
        </Box>

    )
}

export default Settings;