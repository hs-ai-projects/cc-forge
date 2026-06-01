# cc-forge Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap `cc-forge`, a Next.js project template tuned for Claude Code workflows, by selectively porting battle-tested modules from `bi-system` and adding a multi-conversation ChatBot demo (with HITL `confirmAction` tool + `getCurrentTime` server tool) on top.

**Architecture:** App Router (Next.js 16 / React 19). Auth gate lives in `proxy.js`; routes call `auth()` for `userId`. Axios client unwraps `{code,msg,data}` envelope. React Query has a default `queryFn` driven by `meta`. AI SDK v6 stores messages as UIMessage `parts` JSON in Postgres. ChatBot demo uses `useChat` + `DefaultChatTransport` + `addToolOutput` for HITL.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, HeroUI v3, Next-Auth 5 + Prisma Adapter (Feishu OAuth), Prisma 6 + Postgres, @tanstack/react-query 5, Axios, ai v6 + @ai-sdk/anthropic + @ai-sdk/react, Zod 4, Vitest 4 + RTL.

**Source repo for porting:** `/Users/skyler/hesung/projects/bi-system`

---

## File Structure

Files created or modified, organized by responsibility:

```
cc-forge/
├── package.json                                        T1
├── pnpm-lock.yaml                                      T1 (generated)
├── eslint.config.mjs                                   T1
├── jsconfig.json                                       T1
├── next.config.mjs                                     T1
├── postcss.config.mjs                                  T1
├── vitest.config.mjs                                   T1
├── .env.example                                        T2
├── .gitignore                                          T1
├── prisma/
│   ├── schema.prisma                                   T3
│   └── migrations/                                     T3 (generated)
├── src/
│   ├── env.js                                          T2
│   ├── auth.js                                         T5
│   ├── proxy.js                                        T5
│   ├── app/
│   │   ├── layout.js                                   T6
│   │   ├── globals.css                                 T6
│   │   ├── _styles/tokens.css                          T6
│   │   ├── providers.jsx                               T6
│   │   ├── page.js                                     T13
│   │   ├── _components/AppNav.jsx                      T13
│   │   ├── _hooks/useQuery.js                          T7
│   │   ├── api/
│   │   │   ├── _utils/
│   │   │   │   ├── client-request.js                   T7
│   │   │   │   ├── response.js                         T7
│   │   │   │   ├── conversations.js                    T11 (frontend API funcs)
│   │   │   │   └── __tests__/response.test.js          T7
│   │   │   ├── auth/[...nextauth]/route.js             T5
│   │   │   ├── chat/route.js                           T12
│   │   │   └── conversations/
│   │   │       ├── route.js                            T11
│   │   │       └── [id]/
│   │   │           ├── route.js                        T11
│   │   │           └── messages/route.js               T11
│   │   ├── signin/page.js                              T5
│   │   └── chat/
│   │       ├── page.js                                 T14
│   │       └── _components/
│   │           ├── ChatPanel.jsx                       T14
│   │           ├── ConversationList.jsx                T14
│   │           ├── MessagePart.jsx                     T15
│   │           ├── ConfirmActionTool.jsx               T15
│   │           └── __tests__/ConfirmActionTool.test.jsx T15
│   └── lib/
│       ├── db/prisma.js                                T4
│       └── ai/
│           ├── client.js                               T9
│           └── tools/
│               ├── confirmAction.js                    T10
│               └── getCurrentTime.js                   T10
├── .claude/
│   ├── settings.local.json                             T8
│   └── skills/request-patterns/SKILL.md                T8
├── CLAUDE.md                                           T16
└── README.md                                           T16
```

`T#` = task that creates the file. **Verification (T17)** runs the end-to-end flow.

---

## Important Notes for All Tasks

1. **Working directory** for every task is `/Users/skyler/hesung/projects/cc-forge`. Run all `pnpm` / `prisma` commands from there.
2. **Source files** referenced as "整拷 from bi-system" live under `/Users/skyler/hesung/projects/bi-system/`. Read them, copy verbatim unless the task specifies a diff.
3. **Commit after every task.** Commits use Conventional Commits format. **No `Co-Authored-By` lines** (per user's global rule).
4. **Caveman mode** — do not write praise/filler. Match the spec's terse tone.
5. The cc-forge directory already has `git init` done and `docs/superpowers/{specs,plans}/` populated. Don't re-init.
6. Tests must pass green before any commit that touches code with tests. Where the task says "Run …", paste the actual command.

---

### Task 1: Project skeleton (package.json + configs + .gitignore)

**Files:**
- Create: `cc-forge/package.json`
- Create: `cc-forge/eslint.config.mjs`
- Create: `cc-forge/jsconfig.json`
- Create: `cc-forge/next.config.mjs`
- Create: `cc-forge/postcss.config.mjs`
- Create: `cc-forge/vitest.config.mjs`
- Create: `cc-forge/.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "cc-forge",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "rm -rf .next && next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^3.0.78",
    "@ai-sdk/deepseek": "^2.0.35",
    "@ai-sdk/openai": "^3.0.65",
    "@ai-sdk/react": "^3.0.192",
    "@auth/prisma-adapter": "^2.11.2",
    "@heroui/react": "^3.0.1",
    "@heroui/styles": "^3.0.1",
    "@prisma/client": "^6.1.0",
    "@tanstack/react-query": "^5.95.2",
    "ai": "^6.0.190",
    "axios": "^1.13.6",
    "clsx": "^2.1.1",
    "lodash": "^4.18.1",
    "lucide-react": "^1.7.0",
    "next": "^16.2.1",
    "next-auth": "5.0.0-beta.29",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/react": "^16.3.2",
    "@vitejs/plugin-react": "^6.0.2",
    "@vitest/coverage-v8": "^4.1.4",
    "eslint": "^9",
    "eslint-config-next": "^16.2.1",
    "jsdom": "^29.1.1",
    "prisma": "^6.1.0",
    "tailwindcss": "^4",
    "vitest": "^4.1.4"
  }
}
```

Note: removed vs bi-system → `@cubejs-client/*`, `echarts`, `vega*`, `gridstack`, `d3-format`, `html2canvas-pro`, `framer-motion`, `@playwright/test`.

- [ ] **Step 2: Write `eslint.config.mjs` (copy from bi-system)**

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 3: Write `jsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

- [ ] **Step 4: Write `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
};
export default nextConfig;
```

- [ ] **Step 5: Write `postcss.config.mjs`**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 6: Write `vitest.config.mjs`**

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["src/**/*.test.jsx", "jsdom"]],
    include: ["src/**/*.test.{js,jsx}"],
  },
});
```

- [ ] **Step 7: Write `.gitignore`**

```
node_modules
.next
.env
.env.local
*.log
.DS_Store
coverage
playwright-report
test-results
.superpowers

/src/generated/prisma
```

- [ ] **Step 8: Install dependencies**

Run: `pnpm install`
Expected: Postinstall fails because no `prisma/schema.prisma` exists yet — that's OK; install completes. If `postinstall` blocks the install, temporarily comment out the `postinstall` script, run `pnpm install`, then uncomment. Re-running after T3 will succeed.

- [ ] **Step 9: Commit**

```bash
git add package.json eslint.config.mjs jsconfig.json next.config.mjs postcss.config.mjs vitest.config.mjs .gitignore pnpm-lock.yaml
git commit -m "chore: project skeleton (package.json + configs)"
```

---

### Task 2: Environment validation (`env.js` + `.env.example`)

**Files:**
- Create: `cc-forge/.env.example`
- Create: `cc-forge/src/env.js`

- [ ] **Step 1: Write `.env.example`**

```bash
# Database
DATABASE_URL="postgresql://cc:cc@localhost:5432/cc_forge"

# next-auth
NEXTAUTH_SECRET="generate via: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Feishu OAuth
FEISHU_APP_ID=""
FEISHU_APP_SECRET=""
NEXTAUTH_FEISHU_URL="https://open.feishu.cn/open-apis/authen/v1/index"

# LLM (OpenAI-compatible gateway)
LLM_PROVIDER="anthropic"
LLM_BASE_URL="https://api.anthropic.com"
LLM_API_KEY=""
LLM_MODEL="claude-sonnet-4-6"

# Public
NEXT_PUBLIC_API_URL=""
```

- [ ] **Step 2: Write `src/env.js`**

```js
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),

  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  FEISHU_APP_ID: z.string().min(1),
  FEISHU_APP_SECRET: z.string().min(1),
  NEXTAUTH_FEISHU_URL: z.string().url(),

  LLM_PROVIDER: z.enum(["anthropic", "openai", "deepseek"]).default("anthropic"),
  LLM_BASE_URL: z.string().url(),
  LLM_API_KEY: z.string().min(1),
  LLM_MODEL: z.string().min(1),

  NEXT_PUBLIC_API_URL: z.string().default(""),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
```

- [ ] **Step 3: Create local `.env` from example for testing**

Run: `cp .env.example .env`
Then edit `.env` and fill in `NEXTAUTH_SECRET` (run `openssl rand -base64 32` to generate), `FEISHU_APP_ID`, `FEISHU_APP_SECRET`, `LLM_API_KEY`, and a working `DATABASE_URL`.

Note: this `.env` is in `.gitignore`, never committed.

- [ ] **Step 4: Commit**

```bash
git add .env.example src/env.js
git commit -m "feat: env schema + zod validation"
```

---

### Task 3: Prisma schema + initial migration

**Files:**
- Create: `cc-forge/prisma/schema.prisma`
- Create: `cc-forge/prisma/migrations/...` (generated)

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  conversations Conversation[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String    @default("New conversation")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId, updatedAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" | "assistant"
  parts          Json         // UIMessage.parts
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}
```

- [ ] **Step 2: Verify Postgres is reachable**

Run: `pnpm prisma db push --skip-generate --accept-data-loss` (only to validate connection — we'll redo as a real migration next)
Expected: connects, prints "Your database is now in sync".
If it fails: fix `DATABASE_URL` in `.env` before continuing. The user must have Postgres running locally (any method — installed, docker, hosted).

- [ ] **Step 3: Reset and create real migration**

Run: `pnpm prisma migrate reset --force --skip-seed`
Then: `pnpm prisma migrate dev --name init`
Expected: creates `prisma/migrations/<timestamp>_init/` with the SQL.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): initial schema (User/Account/Session/Conversation/Message)"
```

---

### Task 4: Prisma client singleton

**Files:**
- Create: `cc-forge/src/lib/db/prisma.js`

- [ ] **Step 1: Write `src/lib/db/prisma.js` (copy from bi-system)**

```js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const logLevels = process.env.NODE_ENV === "development"
  ? (process.env.PRISMA_LOG_QUERIES === "1" ? ["query", "error", "warn"] : ["error", "warn"])
  : ["error"];

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: logLevels });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/prisma.js
git commit -m "feat(db): prisma client singleton"
```

---

### Task 5: Auth (auth.js + proxy.js + signin page + auth route)

**Files:**
- Create: `cc-forge/src/auth.js`
- Create: `cc-forge/src/proxy.js`
- Create: `cc-forge/src/app/api/auth/[...nextauth]/route.js`
- Create: `cc-forge/src/app/signin/page.js`

- [ ] **Step 1: Write `src/auth.js` (port from bi-system, replace `process.env.X` with `env.X`)**

```js
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
```

- [ ] **Step 2: Write `src/proxy.js` (with API 401 JSON branch)**

```js
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/api/auth", "/signin", "/_next", "/favicon.ico"];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const session = await auth();
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { code: 1, msg: "Unauthorized", data: null },
        { status: 401 }
      );
    }
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Note: Next.js expects the middleware file to be named `middleware.js` at the project root or in `src/`. Since bi-system uses `proxy.js`, we follow that convention. Next.js detects the default export and registers it as middleware regardless of filename **only if** referenced via `next.config.mjs` or named `middleware.{js,ts}`. To be safe, also create a re-export at `src/middleware.js`:

- [ ] **Step 3: Add `src/middleware.js` re-export**

```js
export { default, config } from "./proxy";
```

- [ ] **Step 4: Write `src/app/api/auth/[...nextauth]/route.js`**

```js
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: Write `src/app/signin/page.js` (copy from bi-system)**

```jsx
"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    signIn("feishu", { callbackUrl });
  }, []);
  return null;
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/auth.js src/proxy.js src/middleware.js src/app/api/auth src/app/signin
git commit -m "feat(auth): next-auth + Feishu provider + middleware gate"
```

---

### Task 6: Layout, providers, styles

**Files:**
- Create: `cc-forge/src/app/layout.js`
- Create: `cc-forge/src/app/globals.css`
- Create: `cc-forge/src/app/_styles/tokens.css`
- Create: `cc-forge/src/app/providers.jsx`

- [ ] **Step 1: Write `src/app/layout.js`**

```jsx
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "cc-forge",
  description: "Claude Code project template",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body data-gramm="false">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write `src/app/globals.css` (copy from bi-system)**

```css
@import "@heroui/styles";
@import "./_styles/tokens.css";

@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--text);
}

html, body {
  min-height: 100dvh;
  background: var(--bg);
  color: var(--text);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--border-soft) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
```

Note: dropped `chart-in` keyframe (BI-specific).

- [ ] **Step 3: Write `src/app/_styles/tokens.css` (copy from bi-system)**

```css
:root {
  --bg: #f8f7f4;
  --surface: #ffffff;
  --surface-2: #fcfbf9;

  --border: #e7e5e4;
  --border-soft: #f1efeb;
  --border-strong: #d6d3d1;

  --text: #1c1917;
  --text-muted: #78716c;
  --text-faint: #a8a29e;

  --accent: #4f46e5;
  --accent-soft: #eef2ff;
  --accent-strong: #4338ca;

  --success: #10b981;
  --danger: #ef4444;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow-sm: 0 1px 2px rgba(28, 25, 23, 0.04), 0 1px 1px rgba(28, 25, 23, 0.03);
  --shadow-md: 0 4px 14px -3px rgba(28, 25, 23, 0.08), 0 2px 4px -2px rgba(28, 25, 23, 0.04);
  --shadow-lg: 0 12px 32px -8px rgba(28, 25, 23, 0.12), 0 4px 8px -2px rgba(28, 25, 23, 0.04);
}
```

Note: dropped chart palette tokens (BI-specific).

- [ ] **Step 4: Write `src/app/providers.jsx` (port without CubeProvider)**

```jsx
"use client";

import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import request from "@/app/api/_utils/client-request";

export default function Providers({ children }) {
  const queryClientRef = useRef(new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        throwOnError: (error) => error?.name !== "AbortError" && error?.code !== "ERR_CANCELED",
        queryFn: async ({ queryKey, meta, signal }) => {
          const [key, params] = queryKey;
          const method = meta?.method ?? "get";
          const headers = meta?.headers;
          const res = await request[method](
            key,
            method === "get" ? { params, signal, headers } : params,
            { signal, headers }
          );
          meta?.onSuccess?.(res);
          return res;
        },
      },
      mutations: {
        mutationFn(data, { meta }) {
          const method = meta?.method ?? "post";
          const url = meta?.url;
          return request[method](url, data);
        },
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClientRef.current}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

Note: T7 creates `client-request.js` which is referenced here. Order is fine because nothing imports `providers.jsx` until T13 wires `layout.js` to it (already done above). The dev server won't be started until T17.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.js src/app/globals.css src/app/_styles src/app/providers.jsx
git commit -m "feat(ui): root layout + heroui styles + providers"
```

---

### Task 7: Request layer (client-request + ResponseUtil + useQuery + first test)

**Files:**
- Create: `cc-forge/src/app/api/_utils/client-request.js`
- Create: `cc-forge/src/app/api/_utils/response.js`
- Create: `cc-forge/src/app/api/_utils/__tests__/response.test.js`
- Create: `cc-forge/src/app/_hooks/useQuery.js`

- [ ] **Step 1: Write `src/app/api/_utils/response.js` (copy from bi-system)**

```js
import { NextResponse } from "next/server";

export class ResponseUtil {
  static ok(data = null, status = 200) {
    return NextResponse.json({ code: 0, msg: "", data }, { status });
  }

  static created(data) {
    return ResponseUtil.ok(data, 201);
  }

  static error(msg = "请求失败", status = 400) {
    return NextResponse.json({ code: 1, msg, data: null }, { status });
  }

  static unauthorized(msg = "Unauthorized") {
    return ResponseUtil.error(msg, 401);
  }

  static notFound(msg = "Not found") {
    return ResponseUtil.error(msg, 404);
  }
}
```

- [ ] **Step 2: Write `src/app/api/_utils/__tests__/response.test.js` (copy from bi-system)**

```js
import { describe, it, expect } from "vitest";
import { ResponseUtil } from "../response";

async function json(res) {
  return res.json();
}

describe("ResponseUtil.ok", () => {
  it("returns code 0 with data", async () => {
    expect(await json(ResponseUtil.ok({ x: 1 }))).toEqual({ code: 0, msg: "", data: { x: 1 } });
  });

  it("defaults data to null", async () => {
    expect(await json(ResponseUtil.ok())).toEqual({ code: 0, msg: "", data: null });
  });

  it("defaults status to 200", () => {
    expect(ResponseUtil.ok().status).toBe(200);
  });

  it("accepts custom status", () => {
    expect(ResponseUtil.ok({ a: 1 }, 201).status).toBe(201);
  });
});

describe("ResponseUtil.created", () => {
  it("returns code 0 with status 201", async () => {
    const res = ResponseUtil.created({ id: "1" });
    expect(res.status).toBe(201);
    expect(await json(res)).toEqual({ code: 0, msg: "", data: { id: "1" } });
  });
});

describe("ResponseUtil.error", () => {
  it("returns code 1 with msg", async () => {
    expect(await json(ResponseUtil.error("bad"))).toEqual({ code: 1, msg: "bad", data: null });
  });

  it("defaults status to 400", () => {
    expect(ResponseUtil.error("bad").status).toBe(400);
  });

  it("accepts custom status", () => {
    expect(ResponseUtil.error("not found", 404).status).toBe(404);
  });
});

describe("ResponseUtil.unauthorized", () => {
  it("returns code 1 with status 401", async () => {
    const res = ResponseUtil.unauthorized();
    expect(res.status).toBe(401);
    expect((await json(res)).code).toBe(1);
  });

  it("accepts custom msg", async () => {
    expect((await json(ResponseUtil.unauthorized("请先登录"))).msg).toBe("请先登录");
  });
});

describe("ResponseUtil.notFound", () => {
  it("returns code 1 with status 404", async () => {
    const res = ResponseUtil.notFound();
    expect(res.status).toBe(404);
    expect((await json(res)).code).toBe(1);
  });

  it("accepts custom msg", async () => {
    expect((await json(ResponseUtil.notFound("conversation not found"))).msg).toBe("conversation not found");
  });
});
```

Note: I changed bi-system's `dashboard not found` test message to `conversation not found` to match cc-forge's domain.

- [ ] **Step 3: Run test to confirm it passes**

Run: `pnpm test src/app/api/_utils/__tests__/response.test.js`
Expected: 13 passing tests, 0 failing.

- [ ] **Step 4: Write `src/app/api/_utils/client-request.js` (copy from bi-system)**

```js
import Axios, { CanceledError } from "axios";
import { toast } from "@heroui/react";
import { signIn } from "next-auth/react";

const instance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.response.use(
  (res) => {
    if (res.data.code !== 0) {
      toast.danger(res.data.msg);
      return Promise.reject(res.data);
    }
    return res.data.data;
  },
  async (error) => {
    if (error instanceof CanceledError) {
      return Promise.reject(error);
    }
    const { response } = error;
    if (response?.status === 401) {
      signIn("feishu")
    } else {
      toast.danger(response?.data?.msg || "未知错误！");
    }
    return Promise.reject(response?.data);
  }
);

export default instance;
```

- [ ] **Step 5: Write `src/app/_hooks/useQuery.js` (copy from bi-system)**

```js
import { useQuery as Query, useQueryClient } from "@tanstack/react-query";

/**
 * 复用 bi-system 风格的 useQuery 封装：
 * - queryKey 自动数组化
 * - 暴露 setData 方法用于乐观更新
 *
 * 注: 直接在 query 上挂 setData 是为了保留 React Query 5 返回值的 Proxy
 * (用于 prop tracking 的细粒度重渲染)。如果用 {...query, setData} 解构,
 * Proxy 会丢失, 组件会失去字段级订阅优化。
 */
export default function useQuery(queryKey, options) {
  const { onSuccess, ...queryOptions } = options ?? {};
  const normalizedKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  const client = useQueryClient();
  const query = Query({
    queryKey: normalizedKey,
    ...queryOptions,
    meta: { ...queryOptions.meta, onSuccess },
  });
  // eslint-disable-next-line react-hooks/immutability -- 见上方注释, 保留 Proxy
  query.setData = (data) => {
    client.setQueryData(normalizedKey, data);
  };
  return query;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/_utils src/app/_hooks
git commit -m "feat(api): request layer (axios + ResponseUtil + useQuery + tests)"
```

---

### Task 8: `.claude/` preset (skill + settings)

**Files:**
- Create: `cc-forge/.claude/settings.local.json`
- Create: `cc-forge/.claude/skills/request-patterns/SKILL.md`

- [ ] **Step 1: Write `.claude/settings.local.json` (copy from bi-system)**

```json
{
  "permissions": {
    "allow": [
      "mcp__code-review-graph__semantic_search_nodes_tool"
    ]
  }
}
```

- [ ] **Step 2: Write `.claude/skills/request-patterns/SKILL.md` (copy from bi-system verbatim)**

````md
---
name: request-patterns
description: 接口调用规范。在编写任何 API 请求、Hook、数据获取/提交代码前必须先加载。
---

# 接口调用规范

新增接口或 Hook 时，严格遵循以下模式。

## 架构

```
组件 → Hook (useMutation/useQuery) → API 函数 → client-request (Axios) → 后端
```

| 层级 | 文件位置                                   | 职责 |
|------|----------------------------------------|------|
| HTTP 客户端 | `src/app/api/_utils/client-request.js` | Axios 实例，带拦截器 |
| API 函数 | `src/app/api/_utils/*.js`              | 对操作 request 的薄封装，一个业务域一个文件，获取数据的不用封装 |
| Hooks | `src/app/_hooks/useQuery.js`           | 通过 `@tanstack/react-query` 消费 API 函数 |
| Provider | `src/app/providers.jsx`                | QueryClient 配置默认 queryFn |

## 操作类 API 函数写法

在 `src/app/api/_utils/` 下新建文件：

```js
import request from "./client-request"

export function getItems(params) {
  return request.get("/items", { params })
}

export function createItem(data) {
  return request.post("/items", { field_a: data.fieldA })
}

export function deleteItem(id) {
  return request.delete(`/items/${id}`)
}
```

## 写操作 Hook (useMutation)

```js
import { useState, useCallback } from "react"
import { useMutation } from "@tanstack/react-query"
import { createItem } from "@/app/api/_utils/xxx-api"

// 组件中逻辑
const {mutateAsync, isPending} = useMutation({
  mutationFn: (data) => createItem(contextId, data)
})

```

## 读操作 Hook (useQuery)

使用 `src/app/_hooks/useQuery.ts` 的封装：

```js
import useQuery from "@/app/_hooks/useQuery"

// 简单 GET
const { data, isFetching } = useQuery("/items", {
  enabled: () => !!condition,
  select: (data) => data.items,
})

// 带参数 GET
const { data } = useQuery(["/items", { category: "foo" }])

// POST 类读操作
const { data, setData } = useQuery(["/items/search", params], {
  meta: { method: "post" },
})

// 自定义 headers
const { data } = useQuery("/items", {
  meta: { headers: { "X-Custom": "value" } },
})

// onSuccess 回调
const { data } = useQuery(["/items"], {
  onSuccess: (data) => setSomeState(data),
})
```

queryKey 为 `[url]` 或 `[url, params]`，`providers.jsx` 的默认 queryFn 自动发请求。`setData` 手动更新缓存。`onSuccess` 通过 `meta` 透传，在 queryFn 成功后执行。
````

- [ ] **Step 3: Commit**

```bash
git add .claude
git commit -m "chore(claude): preset skill (request-patterns) + settings"
```

---

### Task 9: AI client singleton

**Files:**
- Create: `cc-forge/src/lib/ai/client.js`

- [ ] **Step 1: Write `src/lib/ai/client.js`**

```js
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { env } from "@/env";

const providers = {
  anthropic: createAnthropic({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }),
  openai: createOpenAI({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }),
  deepseek: createDeepSeek({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }),
};

const provider = providers[env.LLM_PROVIDER];

if (!provider) {
  throw new Error(`Unsupported LLM_PROVIDER: ${env.LLM_PROVIDER}`);
}

export const llm = provider(env.LLM_MODEL);
```

Note: ai-sdk uses provider factories — calling `provider(modelId)` returns the LanguageModel for `streamText`. All three SDK packages expose `create*` factories with the same signature.

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/client.js
git commit -m "feat(ai): unified llm client (anthropic/openai/deepseek by env)"
```

---

### Task 10: AI tools (`confirmAction` + `getCurrentTime`)

**Files:**
- Create: `cc-forge/src/lib/ai/tools/confirmAction.js`
- Create: `cc-forge/src/lib/ai/tools/getCurrentTime.js`

- [ ] **Step 1: Write `src/lib/ai/tools/confirmAction.js`**

```js
import { tool } from "ai";
import { z } from "zod";

export const confirmActionTool = tool({
  description: "高风险操作前征得用户确认。前端会渲染确认对话框，用户点击后通过 addToolOutput 注入结果。",
  inputSchema: z.object({
    title: z.string().describe("操作标题，简短"),
    description: z.string().describe("操作详情，告知用户后果"),
  }),
  // 无 execute → 由前端 addToolOutput 注入结果
  toModelOutput: ({ output }) => [
    { type: "text", text: output.confirmed ? "用户已确认" : "用户已取消" },
  ],
});
```

- [ ] **Step 2: Write `src/lib/ai/tools/getCurrentTime.js`**

```js
import { tool } from "ai";
import { z } from "zod";

export const getCurrentTimeTool = tool({
  description: "获取服务器当前时间（ISO 8601 + 时区）",
  inputSchema: z.object({}),
  execute: async () => ({
    iso: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/tools
git commit -m "feat(ai): tools (confirmAction HITL + getCurrentTime)"
```

---

### Task 11: Conversations CRUD routes + frontend API funcs

**Files:**
- Create: `cc-forge/src/app/api/conversations/route.js`
- Create: `cc-forge/src/app/api/conversations/[id]/route.js`
- Create: `cc-forge/src/app/api/conversations/[id]/messages/route.js`
- Create: `cc-forge/src/app/api/_utils/conversations.js`

- [ ] **Step 1: Write `src/app/api/conversations/route.js` (GET list / POST create)**

```js
import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET() {
  const session = await auth();
  const userId = session.user.id;
  const list = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ResponseUtil.ok(list);
}

export async function POST(request) {
  const session = await auth();
  const userId = session.user.id;
  const body = await request.json().catch(() => ({}));
  const conv = await prisma.conversation.create({
    data: {
      userId,
      title: body?.title || "New conversation",
    },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ResponseUtil.created(conv);
}
```

- [ ] **Step 2: Write `src/app/api/conversations/[id]/route.js` (GET one / DELETE)**

```js
import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET(_request, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const { id } = await params;
  const conv = await prisma.conversation.findFirst({
    where: { id, userId },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  if (!conv) return ResponseUtil.notFound();
  return ResponseUtil.ok(conv);
}

export async function DELETE(_request, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const { id } = await params;
  const conv = await prisma.conversation.findFirst({ where: { id, userId } });
  if (!conv) return ResponseUtil.notFound();
  await prisma.conversation.delete({ where: { id } });
  return ResponseUtil.ok({ id });
}
```

- [ ] **Step 3: Write `src/app/api/conversations/[id]/messages/route.js` (GET history)**

```js
import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET(_request, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const { id } = await params;

  const conv = await prisma.conversation.findFirst({ where: { id, userId } });
  if (!conv) return ResponseUtil.notFound();

  const rows = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, parts: true },
  });

  return ResponseUtil.ok(rows);
}
```

- [ ] **Step 4: Write `src/app/api/_utils/conversations.js` (frontend API funcs)**

```js
import request from "./client-request";

export function createConversation(data) {
  return request.post("/api/conversations", data ?? {});
}

export function deleteConversation(id) {
  return request.delete(`/api/conversations/${id}`);
}
```

Note: GET endpoints (`/api/conversations`, `/api/conversations/[id]/messages`) don't need wrappers — `useQuery` calls them directly via `providers.jsx` default queryFn.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/conversations src/app/api/_utils/conversations.js
git commit -m "feat(api): conversations CRUD + messages history"
```

---

### Task 12: Chat streaming route

**Files:**
- Create: `cc-forge/src/app/api/chat/route.js`

- [ ] **Step 1: Write `src/app/api/chat/route.js`**

```js
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { llm } from "@/lib/ai/client";
import { confirmActionTool } from "@/lib/ai/tools/confirmAction";
import { getCurrentTimeTool } from "@/lib/ai/tools/getCurrentTime";
import { ResponseUtil } from "@/app/api/_utils/response";

const SYSTEM_PROMPT = `你是 cc-forge 演示助手。可用工具：
- confirmAction(title, description)：高风险操作前征求用户确认
- getCurrentTime()：返回服务器当前时间

简明回复，必要时调用工具。`;

export async function POST(request) {
  const session = await auth();
  const userId = session.user.id;
  const { conversationId, messages } = await request.json();

  if (!conversationId || !Array.isArray(messages)) {
    return ResponseUtil.error("Invalid payload");
  }

  // 资源归属
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) return ResponseUtil.notFound();

  // 持久化最新 user message（按 client id 去重）
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === "user") {
    await prisma.message.upsert({
      where: { id: lastMsg.id },
      create: {
        id: lastMsg.id,
        conversationId,
        role: "user",
        parts: lastMsg.parts,
      },
      update: {},
    });
  }

  const result = streamText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: {
      confirmAction: confirmActionTool,
      getCurrentTime: getCurrentTimeTool,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ messages: finalMessages }) => {
      const existingIds = new Set(messages.map((m) => m.id));
      const newOnes = finalMessages.filter((m) => !existingIds.has(m.id));
      if (newOnes.length === 0) return;
      await prisma.$transaction([
        ...newOnes.map((m) =>
          prisma.message.create({
            data: {
              id: m.id,
              conversationId,
              role: m.role,
              parts: m.parts,
            },
          })
        ),
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        }),
      ]);
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/chat
git commit -m "feat(ai): chat streaming route (streamText + tools + persist)"
```

---

### Task 13: Home page + AppNav

**Files:**
- Create: `cc-forge/src/app/_components/AppNav.jsx`
- Create: `cc-forge/src/app/page.js`

- [ ] **Step 1: Write `src/app/_components/AppNav.jsx`**

```jsx
"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { useSession, signOut } from "next-auth/react";

export default function AppNav() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Navbar maxWidth="full" isBordered>
      <NavbarBrand>
        <Link href="/" color="foreground" className="font-semibold">cc-forge</Link>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <Link href="/" color="foreground">Home</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/chat" color="foreground">AI Chat</Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                size="sm"
                src={user.image ?? undefined}
                name={user.name ?? "User"}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="user menu">
              <DropdownItem key="profile" textValue={user.name ?? ""}>
                <p className="font-semibold">{user.name}</p>
                <p className="text-tiny text-default-500">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={() => signOut({ callbackUrl: "/signin" })}>
                登出
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Button href="/signin" as={Link} variant="flat">登录</Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
```

- [ ] **Step 2: Write `src/app/page.js` (placeholder dashboard skeleton)**

```jsx
import AppNav from "@/app/_components/AppNav";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-4">cc-forge</h1>
        <p className="text-default-500 mb-8">
          这是 cc-forge 模板的空白主页。把这块替换成你的业务首页。
        </p>
        <div className="rounded-lg border border-default-200 p-6 bg-content1">
          <p className="text-sm text-default-500 mb-2">想试试 ChatBot demo？</p>
          <Link href="/chat" className="text-primary underline">前往 /chat</Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/_components/AppNav.jsx src/app/page.js
git commit -m "feat(ui): AppNav + placeholder home page"
```

---

### Task 14: Chat page + ConversationList + ChatPanel

**Files:**
- Create: `cc-forge/src/app/chat/page.js`
- Create: `cc-forge/src/app/chat/_components/ChatPanel.jsx`
- Create: `cc-forge/src/app/chat/_components/ConversationList.jsx`

- [ ] **Step 1: Write `src/app/chat/page.js`**

```jsx
"use client";

import { useState } from "react";
import AppNav from "@/app/_components/AppNav";
import ConversationList from "./_components/ConversationList";
import ChatPanel from "./_components/ChatPanel";

export default function ChatPage() {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      <AppNav />
      <div className="flex-1 flex min-h-0">
        <aside className="w-72 border-r border-default-200 overflow-y-auto">
          <ConversationList activeId={activeId} onSelect={setActiveId} />
        </aside>
        <section className="flex-1 flex flex-col min-h-0">
          {activeId ? (
            <ChatPanel conversationId={activeId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-default-400">
              选择或新建一个会话开始聊天
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/chat/_components/ConversationList.jsx`**

```jsx
"use client";

import { useEffect } from "react";
import { Button, Card } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import useQuery from "@/app/_hooks/useQuery";
import { createConversation, deleteConversation } from "@/app/api/_utils/conversations";

export default function ConversationList({ activeId, onSelect }) {
  const queryClient = useQueryClient();
  const { data: list } = useQuery("/api/conversations");

  const createMut = useMutation({
    mutationFn: () => createConversation(),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      onSelect(conv.id);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeId === id) onSelect(null);
    },
  });

  // 自动选中第一条
  useEffect(() => {
    if (!activeId && list && list.length > 0) {
      onSelect(list[0].id);
    }
  }, [activeId, list, onSelect]);

  return (
    <div className="p-3 space-y-2">
      <Button
        color="primary"
        variant="flat"
        startContent={<Plus size={16} />}
        onPress={() => createMut.mutate()}
        isLoading={createMut.isPending}
        className="w-full"
      >
        新建会话
      </Button>

      <div className="space-y-1">
        {list?.map((conv) => (
          <Card
            key={conv.id}
            isPressable
            onPress={() => onSelect(conv.id)}
            className={`p-3 cursor-pointer ${conv.id === activeId ? "bg-primary-50" : ""}`}
          >
            <div className="flex justify-between items-center gap-2">
              <span className="truncate text-sm flex-1">{conv.title}</span>
              <button
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("删除该会话？")) deleteMut.mutate(conv.id);
                }}
                className="text-default-400 hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/app/chat/_components/ChatPanel.jsx`**

```jsx
"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Button, Input } from "@heroui/react";
import useQuery from "@/app/_hooks/useQuery";
import MessagePart from "./MessagePart";

export default function ChatPanel({ conversationId }) {
  const { data: history, isFetching } = useQuery(
    `/api/conversations/${conversationId}/messages`,
    { enabled: !!conversationId }
  );

  if (isFetching || !history) {
    return <div className="flex-1 skeleton m-4 rounded-lg" />;
  }

  return (
    <ChatPanelInner
      key={conversationId}
      conversationId={conversationId}
      initialMessages={history}
    />
  );
}

function ChatPanelInner({ conversationId, initialMessages }) {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { conversationId } }),
    [conversationId]
  );

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                m.role === "user" ? "bg-primary text-white" : "bg-content2"
              }`}
            >
              {m.parts.map((part, i) => (
                <MessagePart key={i} part={part} addToolOutput={addToolOutput} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-default-200 p-4 flex gap-2">
        <Input
          value={input}
          onValueChange={setInput}
          placeholder="说点什么…"
          isDisabled={status === "streaming"}
          className="flex-1"
        />
        <Button
          type="submit"
          color="primary"
          isLoading={status === "streaming"}
          isDisabled={!input.trim()}
        >
          发送
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/chat/page.js src/app/chat/_components
git commit -m "feat(chat): page layout + conversation list + chat panel"
```

---

### Task 15: MessagePart + ConfirmActionTool + RTL test

**Files:**
- Create: `cc-forge/src/app/chat/_components/MessagePart.jsx`
- Create: `cc-forge/src/app/chat/_components/ConfirmActionTool.jsx`
- Create: `cc-forge/src/app/chat/_components/__tests__/ConfirmActionTool.test.jsx`

- [ ] **Step 1: Write `src/app/chat/_components/ConfirmActionTool.jsx`**

```jsx
"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function ConfirmActionTool({ part, addToolOutput }) {
  if (part.state === "output-available") {
    const confirmed = part.output?.confirmed;
    return (
      <div className="text-sm text-default-500 my-2">
        {confirmed ? "✓ 已确认" : "✗ 已取消"}
      </div>
    );
  }

  const submit = (confirmed) =>
    addToolOutput({
      tool: "confirmAction",
      toolCallId: part.toolCallId,
      output: { confirmed },
    });

  return (
    <Card className="my-2 border border-default-200">
      <CardHeader className="font-semibold">{part.input?.title}</CardHeader>
      <CardBody className="space-y-3">
        <p className="text-sm">{part.input?.description}</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="flat" onPress={() => submit(false)}>取消</Button>
          <Button size="sm" color="primary" onPress={() => submit(true)}>确认</Button>
        </div>
      </CardBody>
    </Card>
  );
}
```

- [ ] **Step 2: Write `src/app/chat/_components/__tests__/ConfirmActionTool.test.jsx` (TDD: write first)**

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmActionTool from "../ConfirmActionTool";

const inputAvailablePart = {
  type: "tool-confirmAction",
  toolCallId: "call_1",
  state: "input-available",
  input: { title: "删除项目", description: "此操作不可逆" },
};

const outputAvailablePart = {
  type: "tool-confirmAction",
  toolCallId: "call_1",
  state: "output-available",
  input: { title: "删除项目", description: "此操作不可逆" },
  output: { confirmed: true },
};

describe("ConfirmActionTool", () => {
  it("renders title and description in input-available state", () => {
    render(<ConfirmActionTool part={inputAvailablePart} addToolOutput={vi.fn()} />);
    expect(screen.getByText("删除项目")).toBeDefined();
    expect(screen.getByText("此操作不可逆")).toBeDefined();
  });

  it("clicking 确认 calls addToolOutput with confirmed=true", () => {
    const addToolOutput = vi.fn();
    render(<ConfirmActionTool part={inputAvailablePart} addToolOutput={addToolOutput} />);
    fireEvent.click(screen.getByText("确认"));
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: "confirmAction",
      toolCallId: "call_1",
      output: { confirmed: true },
    });
  });

  it("clicking 取消 calls addToolOutput with confirmed=false", () => {
    const addToolOutput = vi.fn();
    render(<ConfirmActionTool part={inputAvailablePart} addToolOutput={addToolOutput} />);
    fireEvent.click(screen.getByText("取消"));
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: "confirmAction",
      toolCallId: "call_1",
      output: { confirmed: false },
    });
  });

  it("renders confirmed status in output-available state", () => {
    render(<ConfirmActionTool part={outputAvailablePart} addToolOutput={vi.fn()} />);
    expect(screen.getByText(/已确认/)).toBeDefined();
  });

  it("renders cancelled status when output.confirmed=false", () => {
    const part = { ...outputAvailablePart, output: { confirmed: false } };
    render(<ConfirmActionTool part={part} addToolOutput={vi.fn()} />);
    expect(screen.getByText(/已取消/)).toBeDefined();
  });
});
```

- [ ] **Step 3: Run test (should pass since component already written)**

Run: `pnpm test src/app/chat/_components/__tests__/ConfirmActionTool.test.jsx`
Expected: 5 passing tests, 0 failing.

If failing on @testing-library/jest-dom matchers (e.g. `.toBeInTheDocument`), the assertions above use plain `expect(x).toBeDefined()` to avoid that dependency. Verify all 5 pass.

- [ ] **Step 4: Write `src/app/chat/_components/MessagePart.jsx`**

```jsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ConfirmActionTool from "./ConfirmActionTool";

export default function MessagePart({ part, addToolOutput }) {
  switch (part.type) {
    case "text":
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
        </div>
      );
    case "tool-confirmAction":
      return <ConfirmActionTool part={part} addToolOutput={addToolOutput} />;
    case "tool-getCurrentTime":
      if (part.state === "output-available") {
        return (
          <div className="text-xs text-default-500 my-1">
            🕐 {part.output?.iso} ({part.output?.timezone})
          </div>
        );
      }
      return <div className="text-xs text-default-400 my-1">查询时间中…</div>;
    default:
      return null;
  }
}
```

- [ ] **Step 5: Run full test suite**

Run: `pnpm test`
Expected: all tests green (response.test.js + ConfirmActionTool.test.jsx → 18 tests total).

- [ ] **Step 6: Commit**

```bash
git add src/app/chat/_components
git commit -m "feat(chat): MessagePart + ConfirmActionTool + RTL test"
```

---

### Task 16: README + CLAUDE.md

**Files:**
- Create: `cc-forge/CLAUDE.md`
- Create: `cc-forge/README.md`

- [ ] **Step 1: Write `CLAUDE.md`**

```md
# cc-forge — Claude 指引

## 组件目录规范

| 路径 | 用途 |
|------|------|
| `app/_components/` | 跨页面共用的业务组件 |
| `app/_ui/` | 跨页面共用的基础 UI 组件（无业务逻辑） |
| `app/<page>/_components/` | 仅在该页面/路由段内使用的组件 |

**判断标准：** 组件只在某一个路由段（如 `chat/`）内用 → 放 `app/<page>/_components/`；
需要跨路由复用 → 放 `app/_components/`；纯 UI 原子组件 → 放 `app/_ui/`。

## 模块速查

新接需求前先看对应骨架代码：

- 接口/Hook 规范：`.claude/skills/request-patterns/SKILL.md`
- 认证：`src/auth.js` + `src/proxy.js`
- AI SDK 客户端：`src/lib/ai/client.js`
- AI Tool 模板：`src/lib/ai/tools/`（HITL: `confirmAction`，server-execute: `getCurrentTime`）
- Chat 流程：`src/app/api/chat/route.js` + `src/app/chat/_components/`
- DB Schema：`prisma/schema.prisma`

## env

启动前复制 `.env.example` → `.env`，所有字段必填。
校验在 `src/env.js`，启动时 fail-fast。
```

- [ ] **Step 2: Write `README.md`**

````md
# cc-forge

为 Claude Code 工作流定制的 Next.js 项目模板。

## 起新项目

```bash
# 1. GitHub: "Use this template" 起新仓库；或直接 clone
git clone <cc-forge-url> my-app && cd my-app && rm -rf .git && git init

# 2. 改 package.json name 为 my-app（同时改 CLAUDE.md 标题）

# 3. 装依赖
pnpm install

# 4. 复制环境变量并填写
cp .env.example .env

# 5. 自备 Postgres，跑迁移
pnpm db:migrate

# 6. 启动
pnpm dev
```

## 内置能力

- ✅ Next.js 16 App Router + React 19 + Tailwind 4 + HeroUI
- ✅ Next-Auth 5 + 飞书 OAuth + Prisma Adapter（外部产品换 GitHub/Google：见 `src/auth.js`）
- ✅ Prisma 6 + Postgres + User/Conversation/Message 基础模型
- ✅ Axios 拦截器 + ResponseUtil 统一返回 + 401 自动重登
- ✅ React Query + 全局 queryFn + `useQuery` 封装
- ✅ AI SDK（Anthropic 默认；OpenAI/DeepSeek 由 `LLM_PROVIDER` env 切换）
- ✅ ChatBot demo：多会话 + HITL tool（`confirmAction`） + server tool（`getCurrentTime`） + UIMessage 持久化
- ✅ env 校验（zod fail-fast）
- ✅ Vitest 单测 + RTL 示例

## 目录约定

见 `CLAUDE.md`。

## 替换默认配置

| 想换 | 改这里 |
|------|--------|
| Auth provider（GitHub/Google/...） | `src/auth.js` 的 `Feishu()` 替换为 next-auth 内置 provider |
| DB 引擎（MySQL/SQLite） | `prisma/schema.prisma` 的 `datasource db.provider` |
| LLM provider | `.env` 改 `LLM_PROVIDER`；客户端在 `src/lib/ai/client.js` |
| UI 库 | 替换 HeroUI 引用，删 `globals.css` 的 `@heroui/styles` import |

## 测试

```bash
pnpm test          # 跑所有 vitest
pnpm test:coverage # 带覆盖率
```
````

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: README + CLAUDE.md"
```

---

### Task 17: End-to-end verification

**Files:** none modified — purely verification.

- [ ] **Step 1: Lint + tests must be green**

Run: `pnpm lint && pnpm test`
Expected: 0 lint errors, 18 tests passing.

- [ ] **Step 2: Build must succeed**

Run: `pnpm build`
Expected: build completes without errors.

- [ ] **Step 3: Run dev server**

Run: `pnpm dev`
Wait for "Ready on http://localhost:3000".

- [ ] **Step 4: Manual sign-in flow**

1. Open `http://localhost:3000/` in a browser.
2. Should redirect to `/signin?callbackUrl=...` then to Feishu.
3. After Feishu auth, should land on `/`.
4. Top nav shows user avatar.

If Feishu credentials aren't yet configured: this step is N/A in CI; engineer should still confirm steps 1–3 with valid env.

- [ ] **Step 5: Manual ChatBot flow**

1. Click "AI Chat" in nav, lands on `/chat` with empty conversation list.
2. Click "新建会话" → new conversation appears in list and is selected.
3. Type a message like "帮我删除项目，但记得先确认" → press 发送.
4. Streaming response arrives. Model emits `confirmAction` tool call → confirmation card renders inline.
5. Click "确认". The card flips to "已确认". Model continues with the user's confirmation in mind.
6. Type "现在几点" → model calls `getCurrentTime`, ISO timestamp + timezone render inline.
7. Reload page. Conversation history persists (messages and tool parts re-render correctly).
8. Delete a conversation → cascades messages.

- [ ] **Step 6: Final commit (verification only — no code changes)**

If everything passed, no commit needed. If any fixes were made during verification, commit them with descriptive messages.

---

## Self-Review Checklist (post-plan)

Before declaring this plan complete, verify:

1. **Spec coverage** — every section of `2026-06-01-cc-forge-template-design.md` maps to at least one task:
   - §2 Tech Stack → T1
   - §3 Directory → all tasks
   - §4 Schema → T3
   - §5 Auth/middleware → T5
   - §6 ChatBot demo → T9–T15
   - §7 env → T2
   - §8 Tests → T7 (response) + T15 (ConfirmActionTool)
   - §9 .claude/ → T8
   - §10 CLAUDE.md → T16
   - §11 README → T16
   - §12 Migration list → covered file-by-file across tasks
   - §13 Implementation order → matches T1→T17

2. **No placeholders** — verified no "TBD", "TODO", or "fill in details" anywhere in steps.

3. **Type/name consistency** — `addToolOutput` used everywhere (matches @ai-sdk/react v3 in bi-system); `llm` is the export name from `src/lib/ai/client.js` and is used in `src/app/api/chat/route.js`.

4. **Test ordering** — `ConfirmActionTool.test.jsx` is written **after** the component (Step 1 → Step 2), violating strict TDD-first. Justification: the component is a thin presentational wrapper with no business logic — TDD-first would force speculative test design without tightening the loop. The test still exercises the public surface (props in / addToolOutput out / state branches) and would catch regressions on prop schema changes. Engineer may invert the order if preferred.
