"use client";

import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toast } from "@heroui/react";

export default function Providers({ children }) {
  const queryClientRef = useRef(new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        throwOnError: (error) => error instanceof Error && error.name !== "AbortError" && error.code !== "ERR_CANCELED",
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClientRef.current}>
        <Toast.Provider placement="top" />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
