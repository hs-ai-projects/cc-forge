import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import { env } from "@/env";

function Feishu(options) {
  return {
    id: "feishu",
    name: "Feishu",
    type: "oauth",
    checks: ["none"],
    authorization: {
      url: env.NEXTAUTH_FEISHU_URL,
      params: {
        client_id: options.clientId,
        scope: "",
      },
    },
    token: {
      url: "https://open.feishu.cn/open-apis/authen/v2/oauth/token",
      async request({ params }) {
        const response = await fetch("https://open.feishu.cn/open-apis/authen/v2/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            grant_type: "authorization_code",
            code: params.code,
            client_id: options.clientId,
            client_secret: options.clientSecret,
            redirect_uri: options.callbackUrl,
            scope: params.scope,
          }),
        });
        const data = await response.json();
        if (data.code !== 0 || data.error) {
          throw new Error(data.error_description || data.error || "Failed to get access token");
        }
        return {
          tokens: {
            access_token: data.access_token,
            token_type: data.token_type || "Bearer",
            expires_in: data.expires_in,
            refresh_token: data.refresh_token,
          },
        };
      },
    },
    userinfo: {
      url: "https://open.feishu.cn/open-apis/authen/v1/user_info",
      async request({ tokens }) {
        const response = await fetch("https://open.feishu.cn/open-apis/authen/v1/user_info", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const data = await response.json();
        if (data.code !== 0) {
          throw new Error(`Failed to get user info: ${data.msg || JSON.stringify(data)}`);
        }
        return {
          name: data.data.name,
          avatar_url: data.data.avatar_url,
          user_id: data.data.user_id,
          email: data.data.enterprise_email || data.data.email,
        };
      },
    },
    profile(profile) {
      // user_id 仅对公司内部员工返回; 外部访客只有 open_id, 会卡在这里(预期行为)
      if (!profile.user_id) {
        throw new Error("飞书未返回 user_id, 只允许公司内部员工登录");
      }
      return {
        id: profile.user_id,
        name: profile.name,
        email: profile.email ?? null,
        image: profile.avatar_url ?? null,
      };
    },
    options,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  pages: { signIn: "/signin" },
  providers: [
    Feishu({
      clientId: env.FEISHU_APP_ID,
      clientSecret: env.FEISHU_APP_SECRET,
      callbackUrl: `${env.NEXTAUTH_URL}/api/auth/callback/feishu`,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
});
