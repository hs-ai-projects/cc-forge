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
