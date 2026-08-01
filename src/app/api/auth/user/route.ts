import { NextResponse } from "next/server";
import { user, admin } from "@/lib/db";
import { verifyPassword, createToken, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { action, username, password, displayName } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "请填写账号和密码" }, { status: 400 });
  }

  // 注册
  if (action === "register") {
    if (username.length < 3 || !/^[a-zA-Z0-9]+$/.test(username)) {
      return NextResponse.json({ error: "账号需至少3位，只能包含英文字母和数字" }, { status: 400 });
    }
    if (password.length < 8 || /[\u4e00-\u9fff]/.test(password)) {
      return NextResponse.json({ error: "密码需至少8位，不能包含汉字" }, { status: 400 });
    }
    const existing = await user.findUnique({ username });
    if (existing) {
      return NextResponse.json({ error: "账号已被注册" }, { status: 409 });
    }
    const hashed = await hashPassword(password);
    await user.create({ username, displayName: displayName || username, password: hashed });

    const token = await createToken(username);
    const response = NextResponse.json({ ok: true, username, isAdmin: false });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  // 登录 — 先查用户表，再查管理员表
  if (action === "login") {
    let displayName = username;
    let isAdmin = false;

    const existingUser = await user.findUnique({ username });
    if (existingUser) {
      const valid = await verifyPassword(password, existingUser.password);
      if (!valid) {
        return NextResponse.json({ error: "密码错误" }, { status: 401 });
      }
      displayName = existingUser.displayName || username;
    } else {
      // 检查是否是管理员
      const existingAdmin = await admin.findUnique({ username });
      if (existingAdmin) {
        const valid = await verifyPassword(password, existingAdmin.password);
        if (!valid) {
          return NextResponse.json({ error: "密码错误" }, { status: 401 });
        }
        // 自动创建对应的用户记录
        await user.create({ username, displayName: username, password: existingAdmin.password });
        isAdmin = true;
      } else {
        return NextResponse.json({ error: "账号不存在" }, { status: 401 });
      }
    }

    // 额外检查管理员表
    if (!isAdmin) {
      const a = await admin.findUnique({ username });
      isAdmin = !!a;
    }

    const token = await createToken(username);
    const response = NextResponse.json({ ok: true, username, displayName, isAdmin });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}
