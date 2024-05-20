
import { Box, Button, Flex, Grid, Loader, Text, TextInput } from '@mantine/core';
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_BORDER_COLOR, THEM_SPLITER_COLOR } from '@/utils/app/consts';
import { Brands } from '@/types/brands';
import Layout from '@/components/Layouts/Main/Index';
import { IconEdit, IconLayersDifference, IconPlayerPlay, IconPlus } from '@tabler/icons-react';
import { getBrands } from '@/utils/app/global';
import { supabase } from '@/utils/app/supabase-client';
import { useMediaQuery } from '@mantine/hooks';

export default function Home() {

  const router = useRouter();
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [brandName, setBrandName] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const goBoard = async () => {
    if (!await chkExistBrandName()) {
      router.push(`/onboarding/${brandName}`)
    } else {
      setError("Existed same name");
    }
  }

  const chkExistBrandName = async () => {
    setIsloading(true);
    const {
      data: { session },
  } = await supabase.auth.getSession();

    const brands = await getBrands(session?.user?.id);
    let chk: boolean = false;
    brands.map((item: Brands) => {
      if (item.name == brandName) {
        chk = true;
      }
    })
    if (!chk) {
      const res = await fetch('/api/brands/create_brand', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session?.user.id,
          name: brandName
        })
      })
    }
    setIsloading(false);
    return chk;
  }

  return (
    <Box
    >
      <Layout page_name={'board'} >
        <Box className='board-page'>
          <Box>
            <Text size={24} weight={'bold'}>
              Getting Started
            </Text>
            <Text size={16} color='#637381' >
              Follow the steps and create your first brand!
            </Text>
          </Box>
          <Box pt={20} pb={30}
            sx={(theem) => ({
              borderBottom: `1px solid ${THEM_SPLITER_COLOR}`
            })}
          >
            <Grid>
              <Grid.Col md={4} lg={4} sm={1}>
                <Flex
                  w={'100%'}
                  gap={15}
                  direction={'column'}
                  align={'center'}
                  p={15}
                  sx={(theme) => ({
                    border: `1px solid ${THEM_BORDER_COLOR}`,
                    borderRadius: 15
                  })}
                >
                  <Flex
                    w={52} h={52}
                    align={'center'}
                    justify={'center'}
                    sx={(theme) => ({
                      borderRadius: 52,
                      background: '#E0E0493D'
                    })}
                  >
                    <IconEdit color={THEME_COLOR} />
                  </Flex>
                  <Text
                    color='#18232A'
                    size={16}
                    weight={600}
                    className='body-normal'
                  >
                    Step 1: Connect Socials
                  </Text>
                  <Text
                    color='#637381'
                    size={12}
                    weight={500}
                    align='center'
                  >
                    Connect your Social Channels and start the scraping process of historic comments. Those will be catch the tone of your brand to generate on-brand suggestions by AI.
                  </Text>
                </Flex>
              </Grid.Col>
              <Grid.Col md={4} lg={4} sm={1}>
                <Flex
                  w={'100%'}
                  gap={15}
                  direction={'column'}
                  align={'center'}
                  p={15}
                  sx={(theme) => ({
                    border: `1px solid ${THEM_BORDER_COLOR}`,
                    borderRadius: 15
                  })}
                >
                  <Flex
                    w={52} h={52}
                    align={'center'}
                    justify={'center'}
                    sx={(theme) => ({
                      borderRadius: 52,
                      background: '#E0E0493D'
                    })}
                  >
                    <IconLayersDifference color={THEME_COLOR} />
                  </Flex>
                  <Text
                    color='#18232A'
                    size={16}
                    weight={600}
                    className='body-normal'
                  >
                    Step 2: Connect websites
                  </Text>
                  <Text
                    color='#637381'
                    size={12}
                    weight={500}
                    align='center'

                  >
                    Connect your webistes and we will scrape those in backend to make sure we get all relevant information of your brand. Only add the relevant domains, we will get all of the pages!
                  </Text>
                </Flex>
              </Grid.Col>
              <Grid.Col md={4} lg={4} sm={1}>
                <Flex
                  w={'100%'}
                  gap={15}
                  direction={'column'}
                  align={'center'}
                  p={15}
                  sx={(theme) => ({
                    border: `1px solid ${THEM_BORDER_COLOR}`,
                    borderRadius: 15
                  })}
                >
                  <Flex
                    w={52} h={52}
                    align={'center'}
                    justify={'center'}
                    sx={(theme) => ({
                      borderRadius: 52,
                      background: '#E0E0493D'
                    })}
                  >
                    <IconPlus color={THEME_COLOR} />
                  </Flex>
                  <Text
                    color='#18232A'
                    size={16}
                    weight={600}
                    className='body-normal'
                  >
                    Step 3: Upload documents
                  </Text>
                  <Text
                    color='#637381'
                    size={12}
                    weight={500}
                    align='center'
                  >
                    We also offer the possibility to upload any brochures and files in pdf format. Make sure it’s not a scan!
                  </Text>
                </Flex>
              </Grid.Col>
            </Grid>
          </Box>
          <Box mt={30}>
            <div className="relative" style={{ width: '200px' }}>
              <input
                type="text"
                onChange={(event) => setBrandName(event.currentTarget.value)}
                value={brandName}
                className={`block border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none text-gray-600 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${error == '' ? '' : 'error-input'}`}
                placeholder=" "
                id="floating-label"
              />
              <label
                className={`absolute text-sm text-gray-600 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 ${error == '' ? '' : 'error-label'}`}
                htmlFor="floating-label"
              >
                Brand name
              </label>
            </div>
          </Box>
          <Box>
            <Button
              mt={20}
              bg={THEME_COLOR}
              radius={30}
              sx={(theme) => ({
                '&:hover': {
                  background: THEME_COLOR
                }
              })}
              leftIcon={<IconPlayerPlay size={12} color='black' />}
              onClick={() => { goBoard() }}
              loading={isLoading}
              className="button-background"
            >
              <Text color='black' weight={500} className='body-normal'>
                Create new brand
              </Text>
            </Button>
          </Box>
        </Box>
      </Layout>
    </Box>
  )
}
