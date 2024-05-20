import { THEM_SPLITER_COLOR } from "@/utils/app/consts";
import { Box, Button, Flex, Text, TextInput, Avatar, Image, LoadingOverlay } from '@mantine/core';
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useMediaQuery } from '@mantine/hooks';
import { IconPhotoEdit } from "@tabler/icons-react";
import HomeContext from "@/state/index.context";
import { useContext, useEffect, useState } from "react";
import { notifications } from '@mantine/notifications';
import { supabase } from "@/utils/app/supabase-client";

const Account = () => {

    const {
        state: { user_data },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const isMobile = useMediaQuery(`(max-width: 440px)`);
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    let form = useForm({
        initialValues: {
            email: (user_data as any).email,
            name: (user_data as any).full_name,
            password: "",
            avatar: (user_data as any).avatar_url
        },
        validate: {
            email: (val: string) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
            password: (val: string) =>
                val.length <= 6
                    ? "Password should include at least 6 characters"
                    : null,
        },
    });

    useEffect(() => {
        if (form.values.name == "" || !form.values.name) {
            getUserData();
        }
    }, [])

    const getUserData = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch('/api/settings/get_user_data', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: session?.user?.id }),
        })
        if (res.status == 200) {
            const data = await res.json();
            form.setFieldValue("email", data.email);
            form.setFieldValue("name", data.full_name);
            form.setFieldValue("avatar", data.avatar_url);
        }
    }
    
    const changeAccount = async () => {
        setIsLoad(true);
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch('/api/settings/change_account', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: session?.user?.id,
                params: form.values
            }),
        })
        if (res.status == 200) {
            const data = await res.json();
            homeDispatch({
                "field": 'user_data',
                "value": data
            })
            notifications.show({
                color: 'rgba(224, 224, 73, 1)',
                message: 'Success',
            })
        } else {
            notifications.show({
                message: 'Failed',
                color: 'rgba(255, 72, 66, 1)'
            })
        }
        setIsLoad(false);
    }

    const getUserImage = async (file: File) => {
        console.log(file);
        const readAsDataURL = () => {
            return new Promise((resolve, reject) => {
                const FR = new FileReader();
                FR.addEventListener("load", function (evt) {
                    const event = evt as ProgressEvent<FileReader>; // Casting evt to ProgressEvent<FileReader>
                    if (event.target && typeof event.target.result === "string") { // Adding type check for result property
                        const target = event.target as FileReader & {
                            result: string; // Specify the correct type for result property
                        };

                        resolve(target.result);
                    } else {
                        reject(new Error("Invalid file format"));
                    }
                });

                FR.onerror = () => {
                    reject(new Error("Failed to read file"));
                };

                FR.readAsDataURL(file);
            });
        };
        const result = await readAsDataURL();
        form.setFieldValue("avatar", (result as string));
    }

    return (
        <Box
            sx={(theme) => ({
                width: isMobile ? '100%' : '430px'
            })}
        >
            <Flex
                align={'center'}
                justify={'center'}
                sx={(theme) => ({
                    borderBottom: `1px solid ${THEM_SPLITER_COLOR}`
                })}
                pb={20}
            >
                {
                    form.values.avatar == "" || form.values.avatar == null ?
                        <Dropzone
                            accept={{
                                'image/*': [], // All images
                                'text/html': ['.html', '.htm', '.pdf', '.doc', '.docx', '.xls', '.csv', '.xlsx'],
                            }}
                            bg={'#F4F6F8'}
                            onDrop={(files) => {
                                getUserImage(files[0])
                            }}
                            w={120}
                            h={120}
                            style={{ borderRadius: 120 }}
                        >
                            <Flex
                                justify={'center'}
                                gap={5}
                                direction={'column'}
                                align={'center'}
                                mt={20}
                                id="dropzone"
                            >
                                <IconPhotoEdit color="#919EAB" />
                                <Text color='#637381' size={12}>
                                    Upload photo
                                </Text>
                            </Flex>
                        </Dropzone> :
                        <Dropzone
                            accept={{
                                'image/*': [], // All images
                                'text/html': ['.html', '.htm', '.pdf', '.doc', '.docx', '.xls', '.csv', '.xlsx'],
                            }}
                            bg={'#F4F6F8'}
                            onDrop={(files) => {
                                getUserImage(files[0])
                            }}
                            style={{ borderRadius: 120, padding: 0 }}

                        >
                            <Image
                                src={form.values.avatar} alt="" width={'120px'} height={'120px'} radius={120}
                                style={{ cursor: "pointer" }}
                            ></Image>
                        </Dropzone>
                }

            </Flex>
            <Flex
                gap={24}
                align={'center'}
                w={'100%'}
                direction={'column'}
            >
                <form
                    onSubmit={form.onSubmit(() => {
                        // Auth();
                    })}
                    style={{ width: '100%', padding: 16 }}
                >
                    <Flex
                        gap={15}
                        direction={'column'}
                        sx={(theme) => ({
                            width: '100%'
                        })}
                    >
                        <div className="relative">
                            <input
                                type="text"
                                onChange={(event) => {
                                    form.setFieldValue("name", event.target.value)
                                }}
                                value={form.values.name}
                                className={`block border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none text-gray-600 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${error == '' ? '' : 'error-input'}`}
                                placeholder=" "
                            />
                            <label
                                className={`absolute text-sm text-gray-500 text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 ${error == '' ? '' : 'error-label'}`}
                            >
                                Name
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                onChange={(event) => {
                                    form.setFieldValue("email", event.target.value)
                                }}
                                value={form.values.email}
                                className={`block border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none text-gray-600 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${error == '' ? '' : 'error-input'}`}
                                placeholder=" "
                            />
                            <label
                                className={`absolute text-sm text-gray-500 text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 ${error == '' ? '' : 'error-label'}`}
                            >
                                Email Address
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                onChange={(event) => {
                                    form.setFieldValue("password", event.target.value)
                                }}
                                value={form.values.password}
                                type="password"
                                className={`block border-gray-300 px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none text-gray-600 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${error == '' ? '' : 'error-input'}`}
                            />
                            <label
                                className={`absolute text-sm text-gray-500 text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 ${error == '' ? '' : 'error-label'}`}
                            >
                                Password
                            </label>
                        </div>
                        <Flex justify={'flex-end'}>
                            <Button
                                sx={(theme) => ({
                                    color: '#18232A',
                                    '&:hover': {
                                        background: '#eded15'
                                    }
                                })}
                                bg={"#E0E049"}
                                radius={20}
                                onClick={() => {
                                    changeAccount();
                                }}
                                className="button-background"

                            >
                                <Text size={14} className="body-normal">
                                    Save
                                </Text>
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Flex>
            <LoadingOverlay visible={isLoad} className="overloader" />
        </Box>
    )
}

export default Account;