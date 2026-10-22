import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import prisma from "@/lib/db/prisma";
import { env } from "@/env";

const FEISHU_TOKEN_URL = "https://open.feishu.cn/open-apis/authen/v2/oauth/token";
const FEISHU_USERINFO_URL = "https://open.feishu.cn/open-apis/authen/v1/user_info";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "feishu",
          name: "Feishu",
          clientId: env.FEISHU_APP_ID,
          clientSecret: env.FEISHU_APP_SECRET,
          authorizationUrl: env.FEISHU_AUTH_URL,
          tokenUrl: FEISHU_TOKEN_URL,
          userInfoUrl: FEISHU_USERINFO_URL,
          scopes: [],
          pkce: false,
          async getToken({ code, redirectURI }) {
            const response = await fetch(FEISHU_TOKEN_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify({
                grant_type: "authorization_code",
                code,
                client_id: env.FEISHU_APP_ID,
                client_secret: env.FEISHU_APP_SECRET,
                redirect_uri: redirectURI,
              }),
            });
            const data = await response.json();
            if (data.code !== 0 || data.error) {
              throw new Error(data.error_description || data.error || "Failed to get access token");
            }
            return {
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              tokenType: data.token_type || "Bearer",
              accessTokenExpiresAt: data.expires_in
                ? new Date(Date.now() + data.expires_in * 1000)
                : undefined,
              scopes: [],
              raw: data,
            };
          },
          async getUserInfo(tokens) {
            const response = await fetch(FEISHU_USERINFO_URL, {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            const data = await response.json();
            if (data.code !== 0) {
              throw new Error(`Failed to get user info: ${data.msg || JSON.stringify(data)}`);
            }
            // user_id 仅对公司内部员工返回; 外部访客只有 open_id, 会卡在这里(预期行为)
            if (!data.data.user_id) {
              throw new Error("飞书未返回 user_id, 只允许公司内部员工登录");
            }
            return {
              id: data.data.user_id,
              name: data.data.name,
              email: data.data.enterprise_email || data.data.email,
              image: data.data.avatar_url,
              emailVerified: false,
            };
          },
        },
      ],
    }),
    nextCookies(),
  ],
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
