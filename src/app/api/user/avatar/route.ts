import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { user } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const u = await user.findUnique({ username: session.username });
  if (!u) return NextResponse.json({ error: "用户不存在" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "没有文件" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 生成唯一文件名
  const ext = file.name.split(".").pop() || "png";
  const filename = `avatar-${u.id}-${Date.now()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  const avatarPath = `/uploads/${filename}`;
  await user.updateAvatar(session.username, avatarPath);

  return NextResponse.json({ ok: true, avatar: avatarPath });
}
