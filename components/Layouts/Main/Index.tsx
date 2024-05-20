import {
    AppShell,
    Header,
    Box,
    useMantineTheme,
    Navbar,
    Text,
    Flex,
    Menu,
    Button,
    Image,
    NavLink,
    Loader,
    MediaQuery,
    Burger,
    ScrollArea,
} from '@mantine/core';

import MainHeader from '@/components/Layouts/Main/Header';
import { FC, useEffect, useState, useContext } from 'react';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { MOBILE_MODE_SIZE, PAGES } from '@/utils/app/consts';
import { Brands, BrandsState } from '@/types/brands';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/utils/app/supabase-client';
import HomeContext from "@/state/index.context";
import { useMediaQuery } from '@mantine/hooks';

interface Props {
    children: JSX.Element,
    page_name: string | string[] | undefined
}

const MainLayout: FC<Props> = ({ children, page_name }) => {

    const {
        state: { min_sidebar, deleted_source_id, deleted_brand_id },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
    const router = useRouter();
    let { brand: brand_name } = router.query;
    const theme = useMantineTheme();
    const [brands, setBrands] = useState<Brands[]>([]);
    const [selBrand, setSelBrand] = useState<Brands>(BrandsState);
    const [loadingBrands, setLoadingBrands] = useState<boolean>(true);
    const [minSidebar, setMinSidebar] = useState<boolean>(true);
    const [open, setOpen] = useState<boolean>(false);
    /* Prefix ICON on sidebar */
    const renderPageIcon = (page_name: string, sel_path: boolean) => {
        if (page_name == "Dashboard") {
            return <Image
                src='/icons/graph.svg'
                alt=''
                width={24}
            />

        } else if (page_name == "Comments") {
            return <Image
                src='/icons/comment.svg'
                alt=''
                width={24}
            />
        } else {
            return <Image
                src='/icons/learning.svg'
                alt=''
                width={24}
            />
        }
    }

    useEffect(() => {
        getBrands();
    }, [])

    useEffect(() => {
        setOpen(false);
        const min_sidebar = localStorage.getItem("min_sidebar");
        if (!min_sidebar) {
            localStorage.setItem("min_sidebar", minSidebar.toString());
        } else {
            if (min_sidebar == "true") {
                homeDispatch({
                    "field": "min_sidebar",
                    "value": true
                })
            } else {
                homeDispatch({
                    "field": "min_sidebar",
                    "value": false
                })
            }
        }
        setTitle();
    }, [page_name])

    useEffect(() => {
        getBrands();
    }, [brand_name, deleted_source_id, deleted_brand_id])

    const setTitle = () => {
        if (page_name == "settings") {
            document.title = "Settings"
        } else if (typeof page_name == "string" && typeof brand_name == "string") {
            const firstLetter = page_name.charAt(0)
            const firstLetterCap = firstLetter.toUpperCase()
            const remainingLetters = page_name.slice(1)
            const capitalizedWord = firstLetterCap + remainingLetters
            document.title = `${brand_name} - ${capitalizedWord}`;
        }
    }

    const getBrands = async () => {

        if (!brand_name) {
            const _brand_name = localStorage.getItem("brand_name");
            if (_brand_name) {
                brand_name = _brand_name
            }
        }

        setLoadingBrands(true);
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch('/api/brands/get_brands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: session?.user.id })
        });

        if (res.status == 200) {
            const _brands = await res.json();
            setBrands(_brands);
            if (_brands.length == 0) {

            } else {
                let brand = _brands[0]
                _brands.map((item: Brands) => {
                    if (item.name == brand_name) {
                        brand = item;
                    }
                })
                setSelBrand(brand);
                localStorage.setItem("brand_name", brand.name);
            }
        }
        setLoadingBrands(false);
    }

    return (
        <AppShell
            styles={{
                main: {
                    background: isMobile && open ? 'red' : 'white'
                },
            }}
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            navbar={
                page_name == 'onboarding' && brands.length == 0 ? <></> :
                    <Navbar p="md" hiddenBreakpoint="sm" hidden={!open} width={{ sm: 200, lg: min_sidebar ? 80 : 300 }} className='sidebar' style={{ zIndex: 1000 }}>
                        <Flex
                            direction={'column'}
                            justify={'space-between'}
                            style={{ height: '100%' }}
                        >
                            {
                                loadingBrands ? <Flex justify={'center'}><Loader variant='bars' color='rgba(224, 224, 73, 1)' /></Flex> :
                                    brands.length == 0 ?
                                        <Flex align={'center'} justify={'center'}>
                                            <Text color='gray'>
                                                {min_sidebar ? '' : 'No Brands!'}
                                            </Text>
                                        </Flex> :
                                        <Box>
                                            <Menu openDelay={100} closeDelay={400}>
                                                <Menu.Target>
                                                    <Button
                                                        fullWidth
                                                        className='brands'
                                                        sx={(theme) => ({
                                                            background: '#ECEDE7',
                                                            '&:hover': {
                                                                background: '#F5F4F0'
                                                            },
                                                            paddingLeft: min_sidebar ? 0 : '1.125rem',
                                                            paddingRight: min_sidebar ? 0 : '1.125rem',
                                                        })}
                                                    >
                                                        <Flex
                                                            justify={min_sidebar ? 'center' : 'space-between'}
                                                            align={'center'}
                                                            w={'100%'}
                                                        >
                                                            <Flex
                                                                align={'center'}
                                                                gap={10}
                                                            >
                                                                <Image src={selBrand.image && selBrand.image != "" ? selBrand.image : '/logo.svg'} radius={10} width={40} alt='brand_image'
                                                                    style={{ borderRadius: '7px' }}
                                                                />
                                                                {
                                                                    min_sidebar && !isMobile ? <></> :
                                                                        <Box>
                                                                            <Text color='black' size={18} className='headerline'>
                                                                                {
                                                                                    selBrand.name
                                                                                }
                                                                            </Text>
                                                                            <Text color='#637381' className='body-normal'>
                                                                                Brand
                                                                            </Text>
                                                                        </Box>

                                                                }
                                                            </Flex>
                                                            {
                                                                min_sidebar ? <></> :
                                                                    <Box>
                                                                        <Image src={'/brands_menu_icon.png'} alt='' />
                                                                    </Box>
                                                            }
                                                        </Flex>
                                                    </Button>
                                                </Menu.Target>
                                                <Menu.Dropdown className='brands-dropdown' style={{
                                                    boxShadow: `0px 8px 16px 0px #919EAB3D`
                                                }}>
                                                    <ScrollArea h={'300px'} type="auto" scrollHideDelay={2000} w={'100%'}>
                                                        {
                                                            brands.map((item, key) =>
                                                                <Link key={key} href={`/${item.name}/dashboard`} onClick={() => {
                                                                    setSelBrand(item)
                                                                }}>
                                                                    <Menu.Item key={key} w={'100%'} className='body-normal'

                                                                    >
                                                                        <Flex gap={10} align={'center'}>
                                                                            <Image src={item.image ? item.image : '/logo.svg'} radius={10} width={40} alt='brand_image' />
                                                                            <Text>
                                                                                {item.name}
                                                                            </Text>
                                                                        </Flex>
                                                                    </Menu.Item>
                                                                    <Menu.Divider />
                                                                </Link>
                                                            )
                                                        }
                                                        <Menu.Item
                                                            onClick={() => { router.push("/onboarding") }}
                                                            icon={<IconPlus size={14} />}
                                                        >
                                                            Add Brand
                                                        </Menu.Item>
                                                    </ScrollArea>
                                                </Menu.Dropdown>
                                                <Box
                                                    mt={25}
                                                >
                                                    {
                                                        PAGES.map((item, key) =>
                                                            <Link
                                                                key={key}
                                                                href={`/${selBrand.name}/${item.path}`}
                                                            >
                                                                <NavLink
                                                                    sx={(theme) => ({
                                                                        borderRadius: 7,
                                                                        background: page_name == item.path ? '#E4D7CF' : 'transparent',
                                                                        '&:hover': {
                                                                            background: '#E4D7CF'
                                                                        }
                                                                    })}
                                                                    mt={5}
                                                                    className={`${page_name == item.path ? 'sidebar-item-bg' : ''}`}
                                                                    label={
                                                                        <Flex
                                                                            gap={'md'}
                                                                            align={'center'}
                                                                        >
                                                                            {
                                                                                renderPageIcon(item.name, (page_name == item.path ? true : false))
                                                                            }
                                                                            {
                                                                                min_sidebar && !isMobile ? <></> :
                                                                                    <Text size={'16px'} weight={600}
                                                                                        color={
                                                                                            page_name == item.path ? '#393750' : '#18232A'
                                                                                        }
                                                                                        className='body-normal'
                                                                                    >
                                                                                        {
                                                                                            item.name
                                                                                        }
                                                                                    </Text>
                                                                            }

                                                                        </Flex>
                                                                    }
                                                                />
                                                            </Link>
                                                        )
                                                    }
                                                </Box>
                                            </Menu>
                                        </Box>
                            }

                            <Box
                                pt={10}
                                pb={isMobile ? '50px' : '20'}
                                sx={(theme) => ({
                                    borderTop: '1px solid #C4CDD5'
                                })}
                            >
                                <Link href={`/settings`}>
                                    <NavLink
                                        sx={(theme) => ({
                                            borderRadius: 5,
                                            background: page_name == 'settings' ? '#E4D7CF' : 'transparent',
                                            '&:hover': {
                                                background: '#E4D7CF'
                                            }
                                        })}
                                        className={`${page_name == 'settings' ? 'sidebar-item-bg' : ''}`}
                                        label={
                                            <Flex
                                                gap={'md'}
                                            >
                                                <IconSettings />
                                                {
                                                    min_sidebar && !isMobile ? <></> :
                                                        <Text size={'16px'} weight={600} className='body-normal'
                                                            color={
                                                                page_name == "settings" ? '#393750' : '#18232A'
                                                            }
                                                        >
                                                            Settings
                                                        </Text>
                                                }
                                            </Flex>
                                        }
                                    />
                                </Link>
                                {
                                    !isMobile ?
                                        <NavLink
                                            sx={(theme) => ({
                                                borderRadius: 5,
                                                '&:hover': {
                                                    background: '#E4D7CF'
                                                }
                                            })}
                                            mt={5}
                                            label={
                                                <Flex
                                                    gap={'md'}
                                                    onClick={() => {
                                                        localStorage.setItem("min_sidebar", (!min_sidebar).toString());
                                                        homeDispatch({
                                                            "field": 'min_sidebar',
                                                            "value": !min_sidebar
                                                        })
                                                    }}
                                                    align={'center'}
                                                >
                                                    {
                                                        min_sidebar ? <Image src='/icons/sidebar_expand.svg' alt='' width={"24px"} /> :
                                                            <Image src='/icons/sidebar_full.svg' alt='' width={"24px"} />
                                                    }
                                                    {
                                                        min_sidebar && !isMobile ? <></> :
                                                            <Text size={'16px'} weight={600} className='body-normal' color='#18232A'>
                                                                Minimize Sidebar
                                                            </Text>
                                                    }

                                                </Flex>
                                            }
                                        /> : <></>
                                }

                            </Box>
                        </Flex>
                    </Navbar>
            }

            header={
                <Header height={{ base: 50, md: 50 }} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                            <Burger
                                opened={open}
                                onClick={() => setOpen((o) => !o)}
                                size="sm"
                                color={theme.colors.gray[6]}
                                mr="xl"
                            />
                        </MediaQuery>
                        <MainHeader
                        />
                    </div>
                </Header>
            }
        >
            <Box
                sx={(theme) => ({
                    height: '100%'
                })}
            >
                {children}
                {
                    isMobile && open ?
                        <Box sx={(theme) => ({
                            position: 'fixed',
                            background: 'rgba(0,0,0,0.7)',
                            width: '100%',
                            top: '0px',
                            height: '100%'
                        })}
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                        </Box> : <></>
                }

            </Box>
        </AppShell>
    )
}

export default MainLayout;