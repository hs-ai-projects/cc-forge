// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/app/api/_utils/client-request", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import request from "@/app/api/_utils/client-request";
import useQuery from "../useQuery";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useQuery", () => {
  it("以 queryKey[0] 为 URL 调用 request.get", async () => {
    request.get.mockResolvedValue([]);
    const { result } = renderHook(() => useQuery("/api/items"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(request.get).toHaveBeenCalledWith(
      "/api/items",
      { params: undefined, signal: expect.any(AbortSignal), headers: undefined },
      { signal: expect.any(AbortSignal), headers: undefined }
    );
  });

  it("响应后调用 onSuccess", async () => {
    const data = [{ id: 1 }];
    request.get.mockResolvedValue(data);
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useQuery("/api/items", { onSuccess }),
      { wrapper: makeWrapper() }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledWith(data);
  });

  it("string queryKey 规范化为数组", async () => {
    request.get.mockResolvedValue([]);
    const { result } = renderHook(() => useQuery("/api/list"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("setData 写入缓存", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    request.get.mockResolvedValue([]);
    const { result } = renderHook(() => useQuery("/api/list"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => {
      result.current.setData([{ id: 999 }]);
    });
    expect(qc.getQueryData(["/api/list"])).toEqual([{ id: 999 }]);
  });

  it("传入自定义 queryFn 时覆盖默认", async () => {
    const customFn = vi.fn().mockResolvedValue({ custom: true });
    const { result } = renderHook(
      () => useQuery("/api/items", { queryFn: customFn }),
      { wrapper: makeWrapper() }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(request.get).not.toHaveBeenCalled();
    expect(result.current.data).toEqual({ custom: true });
  });
});
