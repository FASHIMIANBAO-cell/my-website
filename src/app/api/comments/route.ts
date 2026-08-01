import { NextResponse } from "next/server";
import { comment, user, admin } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resourceId");
  const isAbout = searchParams.get("about") === "1";

  let comments;
  if (isAbout) {
    comments = await comment.list(null);
  } else if (resourceId) {
    comments = await comment.list(parseInt(resourceId));
  } else {
    comments = await comment.list();
  }
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { content, parentId, resourceId } = await request.json();
  if (!content || !content.trim()) return NextResponse.json({ error: "内容不能为空" }, { status: 400 });

  const u = await user.findUnique({ username: session.username });
  if (u) {
    await comment.create(u.id, content.trim(), parentId || null, resourceId || null);
    return NextResponse.json({ ok: true });
  }

  const a = await admin.findUnique({ username: session.username });
  if (a) {
    await comment.create(0, content.trim(), parentId || null, resourceId || null);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "用户不存在" }, { status: 401 });
}
