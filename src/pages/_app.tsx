import type { AppProps } from "next/app";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import {
  MantineProvider,
  ColorSchemeProvider,
  MantineThemeOverride,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { initialState, HomeInitialState } from "@/state/index.state";
import { useCreateReducer } from "@/hooks/useCreateReducer";
import HomeContext from "@/state/index.context";
import Layout from "@/components/Layouts/Index";
import "@/styles/globals.css";
import { Notifications } from "@mantine/notifications";
import type { Database } from "@/types/types_db";
import { supabaseClient } from "@/utils/app/supabase-client";
import { SessionProvider } from "next-auth/react";
import { QueryParamProvider } from 'use-query-params';
import NextAdapterPages from 'next-query-params/pages';

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: { colorScheme },
  } = contextValue;

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    // const pathname = window.location.pathname;
    // const splited_pathname = pathname.split("/")
    // const tabname = splited_pathname[splited_pathname.length-1]
    // if(tabname == "") {
    //   document.title = 'app.replient.ai'
    // } else {
    //   document.title = tabname.toUpperCase()
    // }
  }, [pageProps])
  const myTheme: MantineThemeOverride = {
    colorScheme: colorScheme,
    spacing: {
      chatInputPadding: "40px",
    },
  };
  return (
    isClient && (
      <QueryParamProvider adapter={NextAdapterPages}>
        <SessionContextProvider supabaseClient={supabaseClient}>
          <SessionProvider session={pageProps.session}>
            <HomeContext.Provider
              value={{
                ...contextValue,
              }}
            >
              <ColorSchemeProvider
                colorScheme={colorScheme}
                toggleColorScheme={() => { }}
              >
                <MantineProvider theme={myTheme} withGlobalStyles withNormalizeCSS>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                  <Notifications />
                </MantineProvider>
              </ColorSchemeProvider>
            </HomeContext.Provider>
          </SessionProvider>
        </SessionContextProvider>
      </QueryParamProvider>
    )
  );
}
