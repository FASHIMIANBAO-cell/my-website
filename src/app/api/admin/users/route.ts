import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { admin, user } from "@/lib/db";

// 管理员才可访问
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const a = admin.findUnique({ username: session.username });
  if (!a) return NextResponse.json({ error: "无权限" }, { status: 403 });
  return NextResponse.json(user.list());
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const a = admin.findUnique({ username: session.username });
  if (!a) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await request.json();
  user.delete(id);
  return NextResponse.json({ ok: true });
}
