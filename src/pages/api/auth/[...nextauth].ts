import { supabaseAdmin } from "@/utils/server/supabase-admin";
import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENTID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_APP_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_SECRET_KEY as string,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      (session.user as any).id = token.id;
      (session as any).accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {  
      if (user) {
        console.log(user);
        const user_info = await addUser(user);
        console.log('--------user info----------------');
        console.log(user_info);
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  secret: process.env.SECRET
});

const addUser = async(user: any) => {
  const { data, error } = await supabaseAdmin.from('users').select("*").eq('email', user.email);
  console.log('--------select data----------------');
  console.log(data);
  if(data) {
    if(data.length > 0) {
      return data[0];
    } else {
      const insert_data = await supabaseAdmin.from('users').insert([{
        email: user.email,
        avatar_url: user.image,
        full_name: user.name
      }]).select('*').limit(1);
      console.log('--------insert data----------------');
      if(!insert_data.error){
        return insert_data.data[0];
      } else {
        console.log(insert_data.error);
      }
    }
  } else {
    console.log(error);
  }
  return false;
}