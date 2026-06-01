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
