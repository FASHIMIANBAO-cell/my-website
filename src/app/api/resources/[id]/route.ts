import { NextResponse } from "next/server";
import { resource } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  resource.delete({ id: parseInt(id) });
  return NextResponse.json({ ok: true });
}
