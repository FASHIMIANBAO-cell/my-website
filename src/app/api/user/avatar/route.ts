import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { user } from "@/lib/db";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const u = await user.findUnique({ username: session.username });
  if (!u) return NextResponse.json({ error: "用户不存在" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "没有文件" }, { status: 400 });

  const ext = file.name.split(".").pop() || "png";
  const blob = await put(`avatars/${u.id}-${Date.now()}.${ext}`, file, {
    access: "public",
  });

  await user.updateAvatar(session.username, blob.url);

  return NextResponse.json({ ok: true, avatar: blob.url });
}
