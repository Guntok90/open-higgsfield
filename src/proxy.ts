import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Auth.js and health stay public.
    if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/health")) {
        return NextResponse.next();
    }

    // Login page is outside the locale tree.
    if (pathname === "/login") {
        if (req.auth) {
            return NextResponse.redirect(new URL("/", req.nextUrl));
        }
        return NextResponse.next();
    }

    // Protect studio + generation APIs. X OAuth is access control only —
    // Grok Imagine still uses server-side XAI_API_KEY, never the X session.
    if (pathname.startsWith("/api/")) {
        if (!req.auth) {
            return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
        }
        return NextResponse.next();
    }

    if (!req.auth) {
        const loginUrl = new URL("/login", req.nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return intlMiddleware(req);
});

export const config = {
    // Include API routes so generation endpoints are session-gated.
    matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
