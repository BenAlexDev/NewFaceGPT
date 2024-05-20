import { Box, Menu, Flex, Text, UnstyledButton, Avatar, Image } from "@mantine/core";
import { useState, useContext, useEffect } from "react";
import HomeContext from "@/state/index.context";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { SupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/app/supabase-client";
import { signOut } from "next-auth/react";
import { notifications } from '@mantine/notifications';

const HomeHeader = () => {
  const [openedAuth, setOpenedAuth] = useState<boolean>(false);
  const user = useUser();
  const router = useRouter();

  const {
    state: { colorScheme, lightMode, user_data },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const initialName = (full_name: any) => {
    if (full_name) {
      const split = full_name.split(" ");
      let initial_name = "";
      if (split.length > 1) {
        initial_name = split[0].substr(0, 1) + split[1].substr(0, 1);
      } else {
        initial_name = split[0].substr(0, 1);
      }
      return initial_name;
    } else {
      return "";
    }
  };
  const handleColorScheme = () => {
    homeDispatch({
      field: "colorScheme",
      value: colorScheme == "dark" ? "light" : "dark",
    });
    homeDispatch({
      field: "lightMode",
      value: lightMode == "dark" ? "light" : "dark",
    });
    localStorage.setItem(
      "colorScheme",
      colorScheme == "dark" ? "light" : "dark"
    );
  };

  useEffect(() => {
    getUserData();
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
    if(res.status == 200) {
      const data = await res.json();
      homeDispatch({
        "value": data,
        "field": 'user_data'
      })
    }
  }

  const handleSignout = (e: any) => {
    e.preventDefault();
    signOut();
  };

  const signout = async (e: any) => {
    await supabase.auth.signOut();
    router.push("/login")
    handleSignout(e);
  };

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
      })}
    >
      <Flex justify="space-between" align="center" direction="row" gap="md">
        <Image
          src={'/replient.svg'}
          alt="logo"
          width={90}
        />
        <Flex align="center" gap={"md"}>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Avatar color="cyan" radius="xl"
                src={user_data?(user_data as any)?.avatar_url:''}
              >
                {/* {initialName(user ? user.user_metadata.full_name : "")} */}
              </Avatar>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.user_metadata.full_name ?? ""}</Menu.Label>
              <Menu.Divider />
              <Menu.Item
                onClick={(e) => {
                  signout(e);
                }}
              >
                Signout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default HomeHeader;