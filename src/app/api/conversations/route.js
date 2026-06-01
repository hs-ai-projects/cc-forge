import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { ResponseUtil } from "@/app/api/_utils/response";

export async function GET() {
  const session = await auth();
  const userId = session.user.id;
  const list = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ResponseUtil.ok(list);
}

export async function POST(request) {
  const session = await auth();
  const userId = session.user.id;
  const body = await request.json().catch(() => ({}));
  const conv = await prisma.conversation.create({
    data: {
      userId,
      title: body?.title || "New conversation",
    },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ResponseUtil.created(conv);
}
