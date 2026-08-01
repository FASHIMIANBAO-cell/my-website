import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { verifyPassword, createToken, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const existingAdmin = await admin.findUnique({ username });

  // 首次运行时自动创建管理员账号
  if (!existingAdmin) {
    const hashed = await hashPassword(password);
    await admin.create({ username, password: hashed });

    const token = await createToken(username);
    const response = NextResponse.json({ ok: true });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  }

  const valid = await verifyPassword(password, existingAdmin.password);
  if (!valid) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const token = await createToken(username);
  const response = NextResponse.json({ ok: true });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
