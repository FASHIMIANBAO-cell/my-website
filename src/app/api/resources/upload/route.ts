import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "没有文件" }, { status: 400 });

  const ext = file.name.split(".").pop() || "jpg";
  const blob = await put(`resources/${Date.now()}.${ext}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
