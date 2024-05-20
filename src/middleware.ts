import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'; 
export const config = {
    matcher: [
        '/((?!_next/|_proxy/|_auth/|_root/|_static|static|_vercel|[\\w-]+\\.\\w+).*)',
    ],
};
export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const url = req.url;
    /* Free Url */
    if ((url.indexOf("/login") > -1 
        || url.indexOf("/signup") > -1) 
        || url.indexOf("/fb_webhook") > -1
        || url.indexOf("/ig_webhook") > -1 
        || url.indexOf("?code=") > -1
        || url.indexOf("/third/") > -1
        || url.indexOf("/socket") > -1
    ) {
        return NextResponse.next();
    }
    
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const requestHeaders = new Headers(req.headers)
    
    const {
        data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) { /** Check Supabse session */
        return NextResponse.rewrite(new URL('/login', req.url))
    } else {
        /* If all things are agreed, skip the requested page */
        requestHeaders.set('user_id', (session as any).user.id.toString());
        NextResponse.next();
    }
}