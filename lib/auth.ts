import NextAuth, { NextAuthOptions } from "next-auth";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
  }
}

interface JwtToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/auth",
        params: {
          scope: [
            "https://www.googleapis.com/auth/youtube",
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.force-ssl",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      token: {
        url: "https://oauth2.googleapis.com/token",
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JwtToken; account?: any }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + (account.expires_in || 3600) * 1000;
      }

      if (token.expiresAt && Date.now() > token.expiresAt) {
        console.log("Refreshing token...");

        if (!token.refreshToken) {
          console.error(
            "No refresh token available, user needs to reauthenticate."
          );
          return {};
        }

        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              refresh_token: token.refreshToken as string,
              grant_type: "refresh_token",
            }),
          });

          const newToken = await response.json();
          if (!response.ok) throw new Error(newToken.error);

          token.accessToken = newToken.access_token;
          token.expiresAt = Date.now() + newToken.expires_in * 1000;
        } catch (e) {
          console.error("Error refreshing token:", e);
          token.accessToken = undefined;
          token.refreshToken = undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};
