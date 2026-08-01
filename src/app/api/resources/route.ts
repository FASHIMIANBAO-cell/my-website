import { NextResponse } from "next/server";
import { resource } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await resource.findMany());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const data = await request.json();
  const r = await resource.create(data);
  return NextResponse.json(r, { status: 201 });
}
