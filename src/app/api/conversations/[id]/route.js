import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET(_request, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const { id } = await params;
  const conv = await prisma.conversation.findFirst({
    where: { id, userId },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  if (!conv) return ResponseUtil.notFound();
  return ResponseUtil.ok(conv);
}

export async function DELETE(_request, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const { id } = await params;
  const conv = await prisma.conversation.findFirst({ where: { id, userId } });
  if (!conv) return ResponseUtil.notFound();
  await prisma.conversation.delete({ where: { id } });
  return ResponseUtil.ok({ id });
}
