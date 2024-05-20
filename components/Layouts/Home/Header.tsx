import { Box, Button, Flex, Text, UnstyledButton, Image } from "@mantine/core";
import { useState, useContext, useEffect } from "react";
import Auth from "@/components/Auth/Drawer";
import HomeContext from "@/state/index.context";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const HomeHeader = () => {
  const [openedAuth, setOpenedAuth] = useState<boolean>(false);
  const [ userInfo, setUserInfo ] = useState<any>('init');

  const user = useUser();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    state: { colorScheme, lightMode },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const setUser = () => {
    if(session?.user || user) {
      if(session?.user){
        setUserInfo(session?.user);
        return;
      }
      if(user) {
        setUserInfo(user);
        return;
      }   
    } else {
      setUserInfo(false);
    }
  }

  useEffect(() => {
    setUser()
  }, [session, user]);

  useEffect(() => {
    console.log('-----Home Router-------------')
    console.log(userInfo);

    if(!userInfo) {
       
    } else {
      if(userInfo != 'init'){
        if(userInfo){
          router.push("/main");
        }
      }
    }
    
  }, [userInfo])
  

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
          width={100}
        />

        <Flex align="center">
          <UnstyledButton onClick={handleColorScheme} variant="outline">
            {colorScheme == "dark" ? (
              <IconSun size={20} />
            ) : (
              <IconMoon size={20} />
            )}
          </UnstyledButton>
          <Button
            variant="outline"
            onClick={() => {
              setOpenedAuth(true);
            }}
            ml={10}
          >
            Signin
          </Button>
        </Flex>
      </Flex>
      <Auth
        opened={openedAuth}
        open={() => {
          setOpenedAuth((opened) => !opened);
        }}
      />
    </Box>
  );
};

export default HomeHeader;