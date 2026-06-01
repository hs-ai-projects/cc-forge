# cc-forge 模板项目设计

> 日期：2026-06-01
> 范围：cc-forge —— 为 Claude Code 工作流定制的 Next.js 项目模板
> 来源：从 bi-system 抽象出可复用的认证/请求/AI/规范底座

---

## 1. 定位与决策

### 1.1 定位

cc-forge 是一个**单一实现 + 文档替换路径**的项目模板：默认配置开箱即用（飞书 OAuth + Postgres + Anthropic + HeroUI），需要换栈时按 README 指引手改对应文件，不做插件化抽象。

### 1.2 目标场景

主要供**公司内部工具**起步使用（飞书 OAuth 默认）。外部产品（GitHub/Google）作为文档化备用方案，不进脚手架。

### 1.3 起项目流程

GitHub "Use this template" / 直接 clone，零脚本。手改 5 处：

1. `package.json.name`
2. `CLAUDE.md` 标题
3. `README.md` 项目名（可选）
4. `.env`
5. 数据库 URL

---

## 2. 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 16 App Router + React 19 |
| 样式 | Tailwind v4 + HeroUI v3 |
| 认证 | Next-Auth 5 + Prisma Adapter + 飞书 OAuth |
| DB | Prisma 6 + Postgres |
| 数据获取 | @tanstack/react-query 5 + Axios + 自定义 useQuery 封装 |
| AI | ai v6 + @ai-sdk/anthropic（默认）/ openai / deepseek 备用 |
| 校验 | Zod 4（env + API） |
| 测试 | Vitest 4 + @testing-library/react |

### 2.1 移除的依赖（vs bi-system）

`@cubejs-client/*`、`echarts`、`vega`、`vega-embed`、`vega-lite`、`gridstack`、`d3-format`、`html2canvas-pro`、`framer-motion`

### 2.2 保留的依赖

`react-markdown` + `remark-gfm`（用于 ChatBot 渲染 assistant message 的 markdown）

---

## 3. 目录结构

```
cc-forge/
├── .claude/
│   ├── settings.local.json
│   └── skills/
│       └── request-patterns/SKILL.md
├── .env.example
├── CLAUDE.md
├── README.md
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── auth.js                              ★ 整拷
│   ├── proxy.js                             ★ 整拷+小改
│   ├── env.js                               (新写)
│   ├── app/
│   │   ├── _components/
│   │   │   └── AppNav.jsx                   (新写)
│   │   ├── _hooks/
│   │   │   └── useQuery.js                  ★ 整拷
│   │   ├── _ui/                             (空，按需)
│   │   ├── api/
│   │   │   ├── _utils/
│   │   │   │   ├── client-request.js        ★ 整拷
│   │   │   │   ├── response.js              ★ 整拷
│   │   │   │   ├── conversations.js         (新写, API 函数封装)
│   │   │   │   └── __tests__/
│   │   │   │       └── response.test.js     ★ 整拷
│   │   │   ├── auth/[...nextauth]/route.js  (新写)
│   │   │   ├── chat/route.js                (新写)
│   │   │   └── conversations/
│   │   │       ├── route.js                 (新写)
│   │   │       └── [id]/
│   │   │           ├── route.js             (新写)
│   │   │           └── messages/route.js    (新写)
│   │   ├── chat/
│   │   │   ├── _components/
│   │   │   │   ├── ChatPanel.jsx            (新写)
│   │   │   │   ├── ConversationList.jsx     (新写)
│   │   │   │   ├── ConfirmActionTool.jsx    (新写)
│   │   │   │   ├── MessagePart.jsx          (新写)
│   │   │   │   └── __tests__/
│   │   │   │       └── ConfirmActionTool.test.jsx  (新写)
│   │   │   └── page.js                      (新写)
│   │   ├── signin/page.js                   ★ 整拷
│   │   ├── globals.css                      ★ 整拷
│   │   ├── layout.js                        ★ 整拷
│   │   ├── page.js                          (新写, 占位 dashboard 骨架)
│   │   └── providers.jsx                    ★ 整拷+小改 (删 CubeProvider)
│   └── lib/
│       ├── ai/
│       │   ├── client.js                    (新写)
│       │   └── tools/
│       │       ├── confirmAction.js         (新写)
│       │       └── getCurrentTime.js        (新写)
│       └── db/
│           └── prisma.js                    ★ 整拷
├── eslint.config.mjs                        ★ 整拷
├── jsconfig.json                            ★ 整拷
├── next.config.mjs                          ★ 整拷
├── postcss.config.mjs                       ★ 整拷
└── vitest.config.mjs                        ★ 整拷
```

`★ 整拷` = 直接从 bi-system 拷贝，不改或仅极小改动。

---

## 4. 数据模型（Prisma schema）

### 4.1 保留（next-auth 必需，去掉 dashboards 关联）

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  conversations Conversation[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Account { /* 整拷 bi-system */ }
model Session { /* 整拷 */ }
model VerificationToken { /* 整拷 */ }
```

### 4.2 新增（ChatBot demo）

```prisma
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
  parts          Json         // UIMessage.parts 数组
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}
```

### 4.3 关键决策

- **存 UIMessage（`parts`）而非 ModelMessage（`content`）**：DB 行可直接喂给 `useChat({ messages })`，免转换。
- **不需要 `order` 字段**：按 `createdAt` 排序即可。
- **Tool 不落库**：tool 定义是代码；tool-call / tool-result 作为 part 存于 assistant message 的 `parts` 数组里。
- **`onDelete: Cascade`**：删会话级联删消息；删用户级联删会话。

---

## 5. 认证与中间件

### 5.1 proxy.js（中间件）

所有 auth 检查统一在 proxy.js，路由不再各自 401 校验。

```js
const PUBLIC_PATHS = ["/api/auth", "/signin", "/_next", "/favicon.ico"];

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

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

### 5.2 路由读 userId

路由内仍调 `auth()` 拿 `session.user.id`（JWT decode 轻量，无性能问题）：

```js
// 标准路由模板
import { auth } from "@/auth";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET() {
  const session = await auth();
  const userId = session.user.id;  // proxy 已保证 session 存在
  // ...
  return ResponseUtil.ok(data);
}
```

### 5.3 资源归属校验

proxy 管"是否登录"，**资源级 authz 仍在 route 层**（如 conversation 是否属于该 user）。

---

## 6. ChatBot demo

### 6.1 路由结构

- `/` —— 占位 dashboard 骨架（顶部 nav + 空内容 + 提示文字 + 链接到 `/chat`）
- `/chat` —— ChatBot（左侧多会话列表 + 右侧消息流）

### 6.2 后端 `POST /api/chat`

参考 `bi-system/src/lib/ai/compose-dashboard.js` 的模式。

**核心流程：**

```js
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { anthropicModel } from "@/lib/ai/client";
import { confirmActionTool } from "@/lib/ai/tools/confirmAction";
import { getCurrentTimeTool } from "@/lib/ai/tools/getCurrentTime";

export async function POST(req) {
  const session = await auth();
  const userId = session.user.id;
  const { conversationId, messages } = await req.json();

  // 1. 资源归属
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conv) return ResponseUtil.notFound();

  // 2. 持久化最新 user message（按 client 提供的 id 去重）
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

  // 3. 起流
  const result = streamText({
    model: anthropicModel,
    messages: convertToModelMessages(messages),
    tools: {
      confirmAction: confirmActionTool,
      getCurrentTime: getCurrentTimeTool,
    },
    stopWhen: stepCountIs(5),
  });

  // 4. onFinish 写入新增 assistant message + bump 父 Conversation.updatedAt
  return result.toUIMessageStreamResponse({
    onFinish: async ({ messages: finalMessages }) => {
      const existingIds = new Set(messages.map(m => m.id));
      const newOnes = finalMessages.filter(m => !existingIds.has(m.id));
      await prisma.$transaction([
        ...newOnes.map(m => prisma.message.create({
          data: {
            id: m.id,
            conversationId,
            role: m.role,
            parts: m.parts,
          },
        })),
        // Prisma @updatedAt 仅在该行被 update 时触发，需要显式 bump
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        }),
      ]);
    },
  });
}
```

### 6.3 Tool 定义

**`src/lib/ai/tools/confirmAction.js`（HITL，无 execute）：**

```js
import { tool } from "ai";
import { z } from "zod";

export const confirmActionTool = tool({
  description: "高风险操作前征得用户确认",
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

**`src/lib/ai/tools/getCurrentTime.js`（server-execute，对照示例）：**

```js
import { tool } from "ai";
import { z } from "zod";

export const getCurrentTimeTool = tool({
  description: "获取服务器当前时间（ISO 8601）",
  inputSchema: z.object({}),
  execute: async () => ({
    iso: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),
});
```

### 6.4 前端

**`/chat/page.js` 布局：**

```
┌────────────────────────────────────────┐
│ AppNav                                 │
├────────────┬───────────────────────────┤
│ Conversation│ ChatPanel                │
│ List        │   messages (markdown)    │
│             │   ─────────────────────  │
│ + New       │   input + send           │
│ - Conv 1    │                          │
│ - Conv 2    │                          │
└────────────┴───────────────────────────┘
```

**`ChatPanel.jsx` 关键逻辑：**

```jsx
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import useQuery from "@/app/_hooks/useQuery";

function ChatPanel({ conversationId }) {
  const { data: history, isFetching } = useQuery(
    `/api/conversations/${conversationId}/messages`,
    { enabled: !!conversationId }
  );

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { conversationId } }),
    [conversationId]
  );

  // history 异步到达：等加载完成再 mount useChat，避免传入空 messages 后再 setMessages 的不同步
  if (isFetching || !history) return <Skeleton />;

  return <ChatPanelInner key={conversationId} initialMessages={history} transport={transport} />;
}

function ChatPanelInner({ initialMessages, transport }) {
  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  return (
    <div>
      {messages.map(m => (
        <Message key={m.id} message={m} addToolOutput={addToolOutput} />
      ))}
      <ChatInput onSend={(text) => sendMessage({ text })} disabled={status === "streaming"} />
    </div>
  );
}
```

**`MessagePart.jsx` 分发渲染：**

```jsx
function MessagePart({ part, addToolOutput }) {
  switch (part.type) {
    case "text":
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>;
    case "tool-confirmAction":
      return <ConfirmActionTool part={part} addToolOutput={addToolOutput} />;
    case "tool-getCurrentTime":
      return <ToolResult name="getCurrentTime" part={part} />;
    default:
      return null;
  }
}
```

**`ConfirmActionTool.jsx`：**

```jsx
function ConfirmActionTool({ part, addToolOutput }) {
  if (part.state === "output-available") {
    return <Done value={part.output} />;
  }
  const submit = (confirmed) => addToolOutput({
    tool: "confirmAction",
    toolCallId: part.toolCallId,
    output: { confirmed },
  });
  return (
    <Card>
      <h3>{part.input.title}</h3>
      <p>{part.input.description}</p>
      <Button onClick={() => submit(true)}>确认</Button>
      <Button onClick={() => submit(false)}>取消</Button>
    </Card>
  );
}
```

### 6.5 持久化时序

```
[用户输入] sendMessage({ text })
  → POST /api/chat (conversationId + messages)
[后端] upsert user message → streamText + tools
[前端] tokens 流回；模型 emit tool-call(confirmAction)
  → 渲染 ConfirmActionTool → 用户点击
  → addToolOutput({ output }) → useChat 自动续 POST /api/chat
[后端] streamText 续流 → onFinish 写新 assistant messages 到 DB
```

### 6.6 多会话 CRUD（`/api/conversations`）

| 方法 | 路径 | 行为 |
|------|------|------|
| GET | `/api/conversations` | 当前 user 的会话列表，按 updatedAt desc |
| POST | `/api/conversations` | 新建空会话，返回 `{ id }` |
| GET | `/api/conversations/[id]` | 元数据 |
| DELETE | `/api/conversations/[id]` | 删（cascade messages） |
| GET | `/api/conversations/[id]/messages` | 历史消息（createdAt asc） |

全部走 `ResponseUtil` + 资源归属校验。

---

## 7. env 校验

### 7.1 `src/env.js`

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

### 7.2 调用规范

- `auth.js`、`lib/ai/client.js` 等 server 代码统一 `import { env } from "@/env"`，禁止裸读 `process.env.*`
- 启动时（编译期）就报错，运行时不再有 env 缺失风险

### 7.3 `.env.example`

去掉 bi-system 里 `cube` 和 `chart engine` 字段；去掉"Plan 01 留空"注释；所有字段必填，让模板一开箱就完整可跑。

---

## 8. 测试

### 8.1 配置

整拷 bi-system 的 `vitest.config.mjs`。

### 8.2 模板示例（带两个）

| 文件 | 类型 | 来源 |
|------|------|------|
| `src/app/api/_utils/__tests__/response.test.js` | 纯函数单测 | 整拷 bi-system |
| `src/app/chat/_components/__tests__/ConfirmActionTool.test.jsx` | RTL 组件交互测试 | 新写 |

`ConfirmActionTool.test.jsx` 覆盖：
- 渲染 input-available 状态（标题/描述/按钮）
- 点击"确认"触发 `addToolOutput({ confirmed: true })`
- 渲染 output-available 状态（已完成态文案）

---

## 9. .claude/ 预装

- **Skills**：仅 `request-patterns`（整拷 bi-system）
- **Rules**：不放项目级 rules，依赖用户 global `~/.claude/rules/`
- **Plugins**：不预装、不在 README 提及
- **settings.local.json**：整拷 bi-system 简版

---

## 10. CLAUDE.md

沿用 bi-system 风格短规范，扩成两段：

1. **组件目录规范**（沿用原版 `_components` / `_ui` / page-local）
2. **模块速查**（指向骨架代码：request-patterns skill / auth.js / ai/client.js / tools/ / schema.prisma）
3. **env 启动说明**

---

## 11. README.md

包含：

1. 起新项目流程（5 步手改清单）
2. 内置能力清单
3. 替换默认配置指引（auth provider / DB / LLM / UI 库）

---

## 12. 文件迁移清单

### A. 整拷（零改动）

`useQuery.js`、`client-request.js`、`response.js`、`prisma.js`、`layout.js`、`globals.css`、`signin/page.js`、`response.test.js`、5 个根配置文件、`.claude/skills/request-patterns/SKILL.md`、`.claude/settings.local.json`

### B. 整拷 + 小改

| 文件 | 改动 |
|------|------|
| `src/auth.js` | `process.env.XXX` → `env.XXX` |
| `src/proxy.js` | 加 `/api/` 路径 401 JSON 分支 |
| `src/app/providers.jsx` | 删 `CubeProvider` 引用 |
| `prisma/schema.prisma` | 删 Dashboard/Widget/旧 Message；加 Conversation/新 Message |
| `.env.example` | 删 cube + chart engine；LLM/Feishu 必填 |
| `package.json` | name 改 `cc-forge`；删 7 个 BI 依赖 |
| `CLAUDE.md` | 标题改；扩"模块速查"段 |

### C. 新写

19 个文件（见 §3 目录结构）

### D. 不带

- `src/app/d/` 整目录、`src/lib/{cube,echarts,vega,chartEngine.js,feishu.js}`
- `src/lib/ai/{compose-dashboard.js,reviewLayout.js,schemas.js,suggestions.js,messages.js}`
- `src/app/api/{charts,cube,dashboards}/`
- `playwright.config.js` + `e2e/`
- `docker-compose.yml`、`patches/`、`pnpm-workspace.yaml`
- bi-system `__tests__/` 里 BI 业务测试

---

## 13. 实施路径

按方案 Z（混合法）。`cc-forge` 目录已 `git init` 并写有本 spec，无须 `create-next-app` 重建。

1. 在 cc-forge 根写 `package.json`（name `cc-forge`，依赖按 §2 + §2.1 / §2.2 调整后的清单）
2. `pnpm install`
3. 整拷 §12.A 文件（保持源路径结构）
4. 应用 §12.B 小改
5. 写 `src/env.js`
6. 写 `prisma/schema.prisma` + 跑 `pnpm db:migrate`（用户提前自备 Postgres，连接串配 `.env`）
7. 写 `src/lib/ai/{client.js,tools/}` + ChatBot 后端 routes（`/api/chat`、`/api/conversations/**`、`/api/auth/[...nextauth]/route.js`）
8. 写 ChatBot 前端（`chat/page.js` + 4 个 `_components`）
9. 写 `AppNav` + 重写 `app/page.js` 占位骨架
10. 写两个示例测试，跑 `pnpm test` 确认绿
11. 端到端跑通：飞书登录 → 进 `/` → 进 `/chat` → 新建会话 → 触发 `confirmAction` 完整闭环
12. 写 README + CLAUDE.md

---

## 14. 不在范围内

明确不做：

- Docker compose（用户自备 Postgres）
- Playwright E2E
- 全局错误边界、404/500 自定义页
- RBAC、多租户
- 国际化（next-intl）
- 日志/Trace（pino / opentelemetry）
- Husky / lint-staged / commitlint
- demo CRUD 页（ChatBot demo 已是唯一 demo）
- env 校验之外的 zod 用法（API 校验在 route 内手写，不另抽公共层）
