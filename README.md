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
