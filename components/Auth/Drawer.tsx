import {
  Drawer,
  Button,
  TextInput,
  Divider,
  Flex,
  UnstyledButton,
  PasswordInput,
  Alert,
  Loader,
  Modal,
} from "@mantine/core";
import { FC, useState, useEffect, useContext } from "react";
import {
  IconBrandApple,
  IconBrandFacebook,
  IconBrandGoogle,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { supabase } from "@/utils/app/supabase-client";
import { useRouter } from "next/router";
import { Provider } from "@supabase/supabase-js";
import { useSession, signIn } from "next-auth/react";
import { SupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface Props {
  opened: boolean;
  open: () => void;
}
const Auth: FC<Props> = ({ opened, open }) => {
  const [authType, setAuthType] = useState<string>("Signin");
  const [errrorMessage, setErrorMessage] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const { data: session } = useSession();
  console.log(session, "sesss");
  const router = useRouter(); 
  const user = useUser();

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
  
  const handleSignin = async (e: any) => {
    e.preventDefault();
    signIn("facebook");
  };

  const Auth = async () => {
    const email = form.values.email;
    const password = form.values.password;

    setIsAuth(true);
    setErrorMessage("");

    if (authType == "Signin") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        open();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: form.values.name,
            email: email,
          },
        },
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        open();
      }
    }
    setIsAuth(false);
  };

  const authProvider = async (type: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: type,
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={open}
        title="Authentication"
        size={'md'}
      >
        <form
          className="pt-20"
          onSubmit={form.onSubmit(() => {
            Auth();
          })}
        >
          <Flex direction="column" gap="md">
            <Button
              variant="default"
              color="gray"
              leftIcon={<IconBrandGoogle />}
              onClick={() => {
                authProvider("google");
              }}
            >
              {" "}
              {authType} with Google{" "}
            </Button>
            {/* {session ? (
              <Button
                variant="default"
                color="gray"
                onClick={handleSignout}
                leftIcon={<IconBrandFacebook />}
              >
                Sign out
              </Button>
            ) : (
              <Button
                variant="default"
                color="gray"
                leftIcon={<IconBrandFacebook />}
                onClick={handleSignin}
              >
                {" "}
                Sign in
              </Button>
            )} */}
            <Button
              variant="default"
              color="gray"
              leftIcon={<IconBrandFacebook   />}
              onClick={(e) => {
                handleSignin(e);
                // authProvider("facebook");
              }}
            >
              {" "}
              {authType} with FaceBook{" "}
            </Button>
            <Button
              variant="default"
              color="gray"
              leftIcon={<IconBrandApple />}
              onClick={() => {
                authProvider("apple");
              }}
            >
              {" "}
              {authType} with Apple{" "}
            </Button>
          </Flex>

          <Divider
            label="Or continue with email"
            labelPosition="center"
            my="lg"
          />
          {authType === "Signup" && (
            <TextInput
              required
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.currentTarget.value)
              }
              radius="md"
              data-autofocus
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@mantine.dev"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="md"
            data-autofocus
          />
          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />

          <UnstyledButton
            pt={20}
            pb={10}
            onClick={() => {
              authType == "Signin"
                ? setAuthType("Signup")
                : setAuthType("Signin");
            }}
          >
            {authType == "Signin"
              ? "Don't have an account? Register"
              : "Have an account? Login"}
          </UnstyledButton>
          {errrorMessage != "" ? (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Error!"
              color="pink"
            >
              {errrorMessage}
            </Alert>
          ) : (
            <></>
          )}

          <Button type="submit" mt="sm" fullWidth variant="outline">
            {isAuth ? <Loader variant="dots" /> : authType}
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default Auth;
