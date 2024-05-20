import { Box, Button, Checkbox, Divider, Flex, Image, Input, LoadingOverlay, PasswordInput, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';
import { useForm } from "@mantine/form";
import { FC, useEffect, useState } from "react";
import { supabase } from "@/utils/app/supabase-client";
import { useCreateReducer } from "@/hooks/useCreateReducer";
import { initialState, HomeInitialState } from "@/state/index.state";
import { useRouter } from "next/router";
import { getBrands } from "@/utils/app/global";

interface AuthFormProps {
    name: string,
    password: string,
    email: string
}

const Auth = () => {
    const isMobile = useMediaQuery(`(max-width: 440px)`);
    const router = useRouter();
    const [authType, setAuthType] = useState<string>('login');
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
            if (authType == "login") {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: provider_type,
                });
            }
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
        if (authType == 'login') {
            return <Login
                setAuthType={(type: string) => { setAuthType(type) }}
                emailAuth={async (form: AuthFormProps) => { return await EmailAuth(form) }}
                providerAuth={providerAuth}
            />;
        } else if (authType == 'signup') {
            return <SignUp
                setAuthType={(type: string) => { setAuthType(type) }}
                providerAuth={providerAuth}
                emailAuth={async (form: AuthFormProps) => { return await EmailAuth(form) }}
            />
        } else {
            return <ForgotPassword
                setAuthType={(type: string) => { setAuthType(type) }}
            />
        }
    }

    return (
        <Box
            sx={(theme) => ({
                width: '100%',
                height: '100%',
                background: '#F5F4F0',
                position: 'absolute'
            })}
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
                        width: isMobile ? '100%' : 440
                    })}
                    // justify={'center'}
                    align={'center'}
                >
                    <Box>
                        <Image src='/logo.png' alt="" width={48} />
                    </Box>
                    {
                        renderAuthForm()
                    }
                </Flex>
            </Flex>
            <LoadingOverlay visible={isLoading} zIndex={1000} />
        </Box>
    )
}

interface ForgotPasswordProps {
    setAuthType: (type: string) => void;
}

const ForgotPassword: FC<ForgotPasswordProps> = ({ setAuthType }) => {
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
    return (
        <Flex
            gap={24}
            align={'center'}
            direction={'column'}
            w={'100%'}
        >
            <Flex
                direction={'column'}
                justify={'center'}
                align={'center'}
            >
                <Text size={24} weight={'bold'}>
                    Forgot your password?
                </Text>
                <Text size={14} align="center" weight={400}>
                    Write your email and we will send you instruction to reset your password.
                </Text>
            </Flex>
            <form
                onSubmit={form.onSubmit(() => {
                    Auth();
                })}
                style={{ width: '100%' }}
            >
                <TextInput size="lg" width={'100%'} placeholder="Email Address" />
                <Button
                    mt={24}
                    sx={(theme) => ({
                        height: 48,
                        color: '#18232A',
                        '&:hover': {
                            background: '#eded15'
                        }
                    })}
                    fullWidth
                    bg={"#E0E049"}
                    radius={32}
                >
                    <Text size={14} weight={'bold'}>
                        Login
                    </Text>
                </Button>
                <Text
                    color="#18232A"
                    align="center" weight={500} size={14}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    mt={24}
                    onClick={() => { setAuthType('login') }}
                >
                    Back to Login
                </Text>
            </form>
        </Flex>
    )
}

interface LoginProps {
    setAuthType: (type: string) => void;
    emailAuth: (form: AuthFormProps) => Promise<string>
    providerAuth: (type: string) => void
}

const Login: FC<LoginProps> = ({
    setAuthType,
    emailAuth,
    providerAuth
}) => {

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
                val.length <= 8
                    ? "Password should include at least 8 characters"
                    : null,
        },
    });

    const authbyEmail = async (form_values: AuthFormProps) => {
        const res = await emailAuth(form_values);
        if (res != "success") {
            form.setFieldError('password', res);
        }
    }

    return (
        <Flex
            gap={24}
            align={'center'}
            direction={'column'}
            w={'100%'}
        >
            <Box>
                <Text size={24} weight={'bold'} className="headerline">
                    Welcome to replient.ai
                </Text>
                <Text size={14} align="center">
                    Login to your account
                </Text>
            </Box>
            <form
                className="pt-20"
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
                    <TextInput
                        size="lg"
                        width={'100%'}
                        placeholder="Email Address"
                        {...form.getInputProps('email')}
                        onChange={(event) =>
                            form.setFieldValue("email", event.currentTarget.value)
                        }
                    />
                    <PasswordInput
                        size="lg"
                        width={'100%'}
                        placeholder="Create Password"
                        {...form.getInputProps('password')}
                        onChange={(event) =>
                            form.setFieldValue("password", event.currentTarget.value)
                        }
                    />
                    <Text color="#18232A"
                        weight={500}
                        size={14}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => { setAuthType('forgot_password') }}
                    >
                        Forgot password?
                    </Text>
                    <Button
                        type="submit"
                        sx={(theme) => ({
                            height: 48,
                            color: '#18232A',
                            '&:hover': {
                                background: '#eded15'
                            }
                        })}
                        fullWidth
                        bg={"#E0E049"}
                        radius={32}
                    >
                        <Text size={14} weight={'bold'}>
                            Login
                        </Text>
                    </Button>
                    <Flex gap={5} justify={'center'}>
                        <Text color="#6B7280" size={14} align="center">
                            You already have an account?
                        </Text>
                        <Text
                            color="#18232A"
                            weight={500}
                            size={14}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => { setAuthType('signup') }}
                        >
                            Sign Up
                        </Text>
                    </Flex>
                </Flex>
            </form>
            <Flex
                gap={15}
                direction={'column'}
                sx={(theme) => ({
                    width: '100%'
                })}
            >
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
                <Button fullWidth variant="outline" radius={32}
                    sx={(theme) => ({
                        border: '1px solid #DFE3E8',
                        height: '48px'
                    })}
                    onClick={() => {
                        providerAuth('facebook');
                    }}
                >
                    <Flex
                        direction={'row'}
                        justify={'center'}
                        align={'center'}
                        gap={15}
                    >
                        <Image src='./fb_icon.png' alt="fb_icon" />
                        <Text color="black" size={14} weight={500}>
                            Login with Facebook
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
                        <Image src='./google_icon.png' alt="fb_icon" />
                        <Text color="black" size={14} weight={500}>
                            Login with Google
                        </Text>
                    </Flex>
                </Button>

            </Flex>
        </Flex>
    )
}

interface SignUpProps {
    setAuthType: (type: string) => void;
    providerAuth: (type: string) => void;
    emailAuth: (form: AuthFormProps) => Promise<string>
}

const SignUp: FC<SignUpProps> = ({ setAuthType, providerAuth, emailAuth }) => {
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
            form.setFieldError('password', res);
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
                <Text size={24} weight={'bold'}>
                    Create You Account
                </Text>
                <Text size={14} align="center">
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
                        <Image src='./fb_icon.png' alt="fb_icon" />
                        <Text color="black" size={14} weight={500}>
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
                        <Image src='./google_icon.png' alt="fb_icon" />
                        <Text color="black" size={14} weight={500}>
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
                className="pt-20"
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
                    <TextInput size="lg" width={'100%'} placeholder="Name"
                        {...form.getInputProps('name')}
                        onChange={(event) =>
                            form.setFieldValue("name", event.currentTarget.value)
                        }
                    />
                    <TextInput size="lg" width={'100%'} placeholder="Email Address"
                        {...form.getInputProps('email')}
                        onChange={(event) =>
                            form.setFieldValue("email", event.currentTarget.value)
                        }
                    />
                    <TextInput size="lg" width={'100%'} placeholder="Create Password" type="password"
                        {...form.getInputProps('password')}
                        onChange={(event) =>
                            form.setFieldValue("password", event.currentTarget.value)
                        }
                    />
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
                        <Text color="#18232A" weight='bold' size={14} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
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
                        bg={"#E0E049"}
                        radius={32}
                        type="submit"
                    >
                        <Text size={14} weight={'bold'}>
                            Sign Up
                        </Text>
                    </Button>
                    <Flex gap={5} justify={'center'}>
                        <Text color="#6B7280" size={14} align="center">
                            Already have an account?
                        </Text>
                        <Text
                            color="#18232A"
                            weight={500}
                            size={14}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => { setAuthType('login') }}
                        >
                            Login
                        </Text>
                    </Flex>
                </Flex>
            </form>
        </Flex>
    )
}

export default Auth;