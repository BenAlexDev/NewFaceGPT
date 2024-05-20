import { Alert, Box, Button, Checkbox, Divider, Flex, Image, Input, LoadingOverlay, PasswordInput, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';
import { useForm } from "@mantine/form";
import { FC, useEffect, useState } from "react";
import { supabase } from "@/utils/app/supabase-client";
import { useCreateReducer } from "@/hooks/useCreateReducer";
import { initialState, HomeInitialState } from "@/state/index.state";
import { useRouter } from "next/router";
import { getBrands } from "@/utils/app/global";
import Link from "next/link";
import { IconAlertCircle } from "@tabler/icons-react";

interface AuthFormProps {
    name: string,
    password: string,
    email: string
}

const Signup = () => {
    const isMobile = useMediaQuery(`(max-width: 440px)`);
    const router = useRouter();
    const [authType, setAuthType] = useState<string>('signup');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const contextValue = useCreateReducer<HomeInitialState>({
        initialState,
    });

    const {
        state: { user_data },
        dispatch
    } = contextValue;

    const providerAuth = async (provider_type: string) => {
        /*  */
        if (provider_type == 'google') {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider_type,
            });
        } else if (provider_type == 'facebook') {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider_type,
            });
        }
    }

    useEffect(() => {
        if (user_data) {
            goPage((user_data as any).id);
        }
    }, [user_data])

    const goPage = async (user_id: string) => {
        const brands = await getBrands(user_id);
        if (brands.length == 0) {
            router.push("/");
        } else {
            router.push(`/${brands[0].name}/dashboard`);
        }
    }
    const EmailAuth = async (
        form: AuthFormProps
    ) => {

        const email = form.email;
        const password = form.password;
        const name = form.name;
        setIsLoading(true);
        if (authType == "login") {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) {
                setIsLoading(false);
                return error.message;
            } else {
                const user: any = data.user;
                const user_dada = {
                    id: user.id,
                    avatar_url: user.user_metadata.avatar_url,
                    email: user.user_metadata.email,
                    name: user.user_metadata.full_name
                }
                dispatch({
                    "field": 'user_data',
                    "value": user_dada
                })
                return "success";
            }
        } else {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        email: email,
                    },
                },
            });
            if (error) {
                setIsLoading(false);
                return error.message;
            } else {
                const user: any = data.user;
                const user_dada = {
                    id: user.id,
                    avatar_url: user.user_metadata.avatar_url,
                    email: user.user_metadata.email,
                    name: user.user_metadata.full_name
                }
                dispatch({
                    "field": 'user_data',
                    "value": user_dada
                })
                return "success";
            }
        }
    }

    const renderAuthForm = () => {

        return <SignUp
            setAuthType={(type: string) => { setAuthType(type) }}
            providerAuth={providerAuth}
            emailAuth={async (form: AuthFormProps) => { return await EmailAuth(form) }}
        />
    }

    return (
        <Box
            sx={(theme) => ({
                width: '100%',
                height: '100%',
                background: '#F5F4F0',
                position: 'absolute',
            })}
            className="auth-card"
        >
            <Flex align={isMobile ? 'left' : 'center'} justify={'center'}
                sx={(theme) => ({
                    height: '100%'
                })}
            >
                <Flex
                    direction='column'
                    gap={24}
                    sx={(theme) => ({
                        borderRadius: 24,
                        background: 'white',
                        padding: 24,
                        width: isMobile ? '100%' : 440,
                        boxShadow: '0px 0px 4px rgba(145, 158, 171, 0.24), 0px 24px 48px rgba(145, 158, 171, 0.24)'
                    })}
                    // justify={'center'}
                    align={'center'}
                >
                    <Box>
                        <Image src='/logo.svg' alt="" width={48} />
                    </Box>
                    {
                        renderAuthForm()
                    }
                </Flex>
            </Flex>
            <LoadingOverlay visible={isLoading} zIndex={1000} className="overloader" />
        </Box>
    )
}

interface SignUpProps {
    setAuthType: (type: string) => void;
    providerAuth: (type: string) => void;
    emailAuth: (form: AuthFormProps) => Promise<string>
}

const SignUp: FC<SignUpProps> = ({ setAuthType, providerAuth, emailAuth }) => {
    const [error, setError] = useState<string>('');
    const form = useForm({
        initialValues: {
            email: "",
            name: "",
            password: "",
            terms: true,
        },
        validate: {
            email: (val: string) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
            password: (val: string) =>
                val.length <= 6
                    ? "Password should include at least 6 characters"
                    : null,
        },
    });
    const authbyEmail = async (form_values: AuthFormProps) => {
        const res = await emailAuth(form_values);
        if (res != "success") {
            setError(res);
        }
    }
    return (
        <Flex
            gap={24}
            align={'center'}
            w={'100%'}
            direction={'column'}
        >
            <Box>
                <Text size={24} className="headerline">
                    Create You Account
                </Text>
                <Text size={14} align="center" weight={500}>
                    {`Let's get started`}
                </Text>
            </Box>
            <Flex
                gap={15}
                direction={'column'}
                sx={(theme) => ({
                    width: '100%'
                })}
            >
                <Button fullWidth variant="outline" radius={32}
                    sx={(theme) => ({
                        border: '1px solid #DFE3E8',
                        height: '48px'
                    })}
                    onClick={() => {
                        providerAuth('facebook')
                    }}
                >
                    <Flex
                        direction={'row'}
                        justify={'center'}
                        align={'center'}
                        gap={15}
                    >
                        <Image src={'/facebook_icon.svg'} alt="" />
                        <Text color="#111928" size={14} weight={500} className="body-normal">
                            Sign up with Facebook
                        </Text>
                    </Flex>
                </Button>
                <Button fullWidth variant="outline" radius={32}
                    sx={(theme) => ({
                        border: '1px solid #DFE3E8',
                        height: '48px'
                    })}
                    onClick={() => {
                        providerAuth('google');
                    }}
                >
                    <Flex
                        direction={'row'}
                        justify={'center'}
                        align={'center'}
                        gap={15}
                    >
                        <Image src={'/google_icon.svg'} alt="" />
                        <Text color="#111928" size={14} weight={500} className="body-normal">
                            Sign up with Google
                        </Text>
                    </Flex>
                </Button>
                <Divider
                    mt={0}
                    label={
                        <Text size={16} weight={500}>or</Text>
                    } labelPosition="center" color="#6B7280"
                    sx={(theme) => ({
                        width: '100%',
                    })}
                    className="auth-devider"
                />
            </Flex>
            <form
                // className="pt-20"
                onSubmit={form.onSubmit((values) => authbyEmail(values))}
                style={{ width: '100%' }}
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
                            id="floating-label"
                        />
                        <label
                            className={`absolute text-sm text-gray-600 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 ${error == '' ? '' : 'error-label'}`}
                            htmlFor="floating-label"
                        >
                            Email Address
                        </label>
                    </div>
                    <div>
                        <div className="relative">

                            <input
                                onChange={(event) => {
                                    form.setFieldValue("password", event.target.value)
                                }}
                                value={form.values.password}
                                type="password"
                                id="floating-label" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                            <label htmlFor="floating_outlined"
                                className="absolute text-sm text-gray-600 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                            >Password</label>
                        </div>
                    </div>
                    {
                        error == '' ? <></> :
                            <Alert icon={<IconAlertCircle size={16} />} title={error} color="red">
                                <></>
                            </Alert>
                    }
                    <Flex
                        direction={'row'}
                        justify={'flex-start'}
                        align={'center'}
                        gap={5}
                    >
                        <Checkbox
                            label={<Text color="#6B7280" size={12}>I agree to</Text>}
                            size={'xs'}

                        />
                        <Text color="#18232A" weight={500} size={14} style={{ cursor: 'pointer', textDecoration: 'underline' }} className="body-normal">
                            Terms and Conditions
                        </Text>
                    </Flex>
                    <Button
                        sx={(theme) => ({
                            height: 48,
                            color: '#18232A',
                            '&:hover': {
                                background: '#eded15'
                            }
                        })}
                        fullWidth
                        radius={32}
                        type="submit"
                        className='button-background'
                    >
                        <Text size={14} weight={600} color='#18232A' >
                            Sign Up
                        </Text>
                    </Button>
                    <Flex gap={5} justify={'center'}>
                        <Text color="#6B7280" size={14} align="center" weight={500}>
                            Already have an account?
                        </Text>
                        <Link href={'/login'}>
                            <Text
                                color="#18232A"
                                weight={500}
                                size={14}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                className="body-normal"
                            >
                                Login
                            </Text>
                        </Link>
                    </Flex>
                </Flex>
            </form>
        </Flex>
    )
}

export default Signup;