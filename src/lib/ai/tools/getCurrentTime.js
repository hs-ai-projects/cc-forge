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
