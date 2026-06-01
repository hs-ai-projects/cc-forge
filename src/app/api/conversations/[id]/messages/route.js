import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET(_request, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const { id } = await params;

  const conv = await prisma.conversation.findFirst({ where: { id, userId } });
  if (!conv) return ResponseUtil.notFound();

  const rows = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, parts: true },
  });

  return ResponseUtil.ok(rows);
}
