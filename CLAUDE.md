## 组件目录规范

| 路径 | 用途 |
|------|------|
| `app/_components/` | 跨页面共用的业务组件 |
| `app/_ui/` | 跨页面共用的基础 UI 组件（无业务逻辑） |
| `app/<page>/_components/` | 仅在该页面/路由段内使用的组件 |

**判断标准：** 组件只在某一个路由段（如 `chat/`）内用 → 放 `app/<page>/_components/`；
需要跨路由复用 → 放 `app/_components/`；纯 UI 原子组件 → 放 `app/_ui/`。

## UI 组件规范

本项目使用 **HeroUI v3**（`@heroui/react`）作为 UI 组件库，写任何前端代码前必须先加载 `heroui-react` skill或mcp 了解正确 API，不得凭记忆猜测 prop 名称。

## API 认证规范

`proxy.js` 统一校验所有非公开路径的 session，API handler 内无需重复判断是否认证。

## 作用域规范

创建新文件（schema、工具函数、helper 等）前，先确认使用范围：只在某一模块/路由内用 → 放在该模块目录下；需要跨模块复用 → 才放 `src/lib/` 或 `app/_components/` 等共享目录。默认优先最小作用域。

## 枚举规范

凡赋值给 Prisma 枚举字段，必须从 `@prisma/client` import 对应枚举并使用枚举值，禁止写字符串字面量。
