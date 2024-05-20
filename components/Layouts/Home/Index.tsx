import { 
    AppShell,
    Header,
    Box,
    useMantineTheme,  
 } from '@mantine/core';
import HomeHeader from '@/components/Layouts/Home/Header';
import { FC, useState } from "react";

interface Props {
    children: JSX.Element,
}

const HomeLayout: FC<Props> = ({children}) => {

    const theme = useMantineTheme();

    return (
        <AppShell
            styles={{
                main: {
                    background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                },
            }}

            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            
            header={
                <Header height={{ base: 50, md: 70 }} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <HomeHeader 

                        />
                    </div>
                </Header>
            }
        >
             <Box
                sx={(theme) =>({
                    maxWidth: '80rem',
                    margin: 'auto',
                    paddingTop: '30px'
                })}
            >
                {children}
            </Box>
        </AppShell>
    )
}

export default HomeLayout;