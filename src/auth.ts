import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "@auth/core/jwt";

declare module "next-auth" {
    interface User {
        username?: string | null;
    }

    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            username?: string | null;
        };
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        username?: string | null;
    }
}

interface TwitterUserInfo {
    data?: {
        id: string;
        name: string;
        username?: string;
        profile_image_url?: string;
        email?: string | null;
    };
}

function allowedUsernames(): string[] {
    return (process.env.AUTH_ALLOWED_X_USERNAMES ?? "")
        .split(",")
        .map((value) => value.trim().replace(/^@/, "").toLowerCase())
        .filter(Boolean);
}

function isUsernameAllowed(username: string | null | undefined): boolean {
    if (!username) return false;
    const allowlist = allowedUsernames();
    // Empty allowlist = nobody is admitted (fill AUTH_ALLOWED_X_USERNAMES for access).
    if (allowlist.length === 0) return false;
    return allowlist.includes(username.replace(/^@/, "").toLowerCase());
}

export const authConfig = {
    trustHost: true,
    providers: [
        Twitter({
            profile(profile) {
                const data = (profile as TwitterUserInfo).data;
                return {
                    id: data?.id ?? "",
                    name: data?.name ?? null,
                    email: data?.email ?? null,
                    image: data?.profile_image_url ?? null,
                    username: data?.username ?? null,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user }) {
            return isUsernameAllowed(user.username);
        },
        async jwt({ token, user }) {
            if (user?.username) (token as JWT).username = user.username;
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.username = (token as JWT).username ?? null;
            }
            return session;
        },
        authorized({ auth, request }) {
            const { pathname } = request.nextUrl;
            if (pathname.startsWith("/api/auth")) return true;
            if (pathname.startsWith("/api/health")) return true;
            if (pathname === "/login" || pathname.endsWith("/login")) return true;
            return !!auth;
        },
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
