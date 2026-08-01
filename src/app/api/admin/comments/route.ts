import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { admin, comment } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const a = await admin.findUnique({ username: session.username });
  if (!a) return NextResponse.json({ error: "无权限" }, { status: 403 });
  return NextResponse.json(await comment.list());
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const a = await admin.findUnique({ username: session.username });
  if (!a) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await request.json();
  await comment.delete(id);
  return NextResponse.json({ ok: true });
}
