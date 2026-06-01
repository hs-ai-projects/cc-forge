import { tool } from "ai";
import { z } from "zod";

export const confirmActionTool = tool({
  description: "高风险操作前征得用户确认。前端会渲染确认对话框，用户点击后通过 addToolOutput 注入结果。",
  inputSchema: z.object({
    title: z.string().describe("操作标题，简短"),
    description: z.string().describe("操作详情，告知用户后果"),
  }),
  // 无 execute → 由前端 addToolOutput 注入结果
  toModelOutput: ({ output }) => [
    { type: "text", text: output.confirmed ? "用户已确认" : "用户已取消" },
  ],
});
