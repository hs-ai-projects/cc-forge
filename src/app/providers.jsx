"use client";

import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import request from "@/app/api/_utils/client-request";
import { Toast } from "@heroui/react";

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
    },
  }));

  return (
    <SessionProvider>
      <Toast.Provider placement="top" />
      <QueryClientProvider client={queryClientRef.current}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
