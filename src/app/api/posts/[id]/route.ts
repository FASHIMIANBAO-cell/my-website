import { NextResponse } from "next/server";
import { post } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json();
  const result = post.update({ id: parseInt(id) }, data);
  return NextResponse.json(result);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  post.delete({ id: parseInt(id) });
  return NextResponse.json({ ok: true });
}
