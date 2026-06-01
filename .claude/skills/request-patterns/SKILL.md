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
