import { NextResponse } from "next/server";
import { setting } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "缺少 key" }, { status: 400 });
  return NextResponse.json({ value: await setting.get(key) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: "缺少 key" }, { status: 400 });
  await setting.set(key, value);
  return NextResponse.json({ ok: true });
}
