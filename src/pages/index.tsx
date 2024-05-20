import { getBrands } from "@/utils/app/global";
import { Box, LoadingOverlay } from "@mantine/core";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/app/supabase-client";

const Index = () => {
  const user = useUser();

  const router = useRouter();
  useEffect(() => {
    goDashboard();
  }, [])

  const goDashboard = async () => {

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const brands = await getBrands(session.user?.id);
      if (brands.length == 0) {
        router.push("/onboarding");
      } else {
        router.push(`/${brands[0].name}/dashboard`)
      }
    } else {
      router.push("/login")
    }
  }
  
  return (
    <Box>
      <LoadingOverlay visible={true} className="overloader"/>
    </Box>
  )
}

export default Index;