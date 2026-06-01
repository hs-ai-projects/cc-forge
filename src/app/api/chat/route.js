import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { llm } from "@/lib/ai/client";
import { confirmActionTool } from "@/lib/ai/tools/confirmAction";
import { getCurrentTimeTool } from "@/lib/ai/tools/getCurrentTime";
import { ResponseUtil } from "@/app/api/_utils/response";

const SYSTEM_PROMPT = `你是 cc-forge 演示助手。可用工具：
- confirmAction(title, description)：高风险操作前征求用户确认
- getCurrentTime()：返回服务器当前时间

简明回复，必要时调用工具。`;

export async function POST(request) {
  const session = await auth();
  const userId = session.user.id;
  const { conversationId, messages } = await request.json();

  if (!conversationId || !Array.isArray(messages)) {
    return ResponseUtil.error("Invalid payload");
  }

  // 资源归属
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) return ResponseUtil.notFound();

  // 持久化最新 user message（按 client id 去重）
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === "user") {
    await prisma.message.upsert({
      where: { id: lastMsg.id },
      create: {
        id: lastMsg.id,
        conversationId,
        role: "user",
        parts: lastMsg.parts,
      },
      update: {},
    });
  }

  const result = streamText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: {
      confirmAction: confirmActionTool,
      getCurrentTime: getCurrentTimeTool,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ messages: finalMessages }) => {
      const existingIds = new Set(messages.map((m) => m.id));
      const newOnes = finalMessages.filter((m) => !existingIds.has(m.id));
      if (newOnes.length === 0) return;
      await prisma.$transaction([
        ...newOnes.map((m) =>
          prisma.message.create({
            data: {
              id: m.id,
              conversationId,
              role: m.role,
              parts: m.parts,
            },
          })
        ),
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        }),
      ]);
    },
  });
}
