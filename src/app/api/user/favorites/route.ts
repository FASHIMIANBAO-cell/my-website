import { NextResponse } from "next/server";
import { favorite, user } from "@/lib/db";
import { getSession } from "@/lib/auth";

// 获取当前用户收藏
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const u = user.findUnique({ username: session.username });
  if (!u) return NextResponse.json({ error: "用户不存在" }, { status: 401 });

  const favs = favorite.findByUser(u.id);
  return NextResponse.json(favs);
}

// 添加收藏
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const u = user.findUnique({ username: session.username });
  if (!u) return NextResponse.json({ error: "用户不存在" }, { status: 401 });

  const { postId } = await request.json();
  favorite.add(u.id, postId);
  return NextResponse.json({ ok: true });
}

// 取消收藏
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const u = user.findUnique({ username: session.username });
  if (!u) return NextResponse.json({ error: "用户不存在" }, { status: 401 });

  const { postId } = await request.json();
  favorite.remove(u.id, postId);
  return NextResponse.json({ ok: true });
}
