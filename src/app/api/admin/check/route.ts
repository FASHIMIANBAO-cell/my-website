import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { admin } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ isAdmin: false });
  const a = await admin.findUnique({ username: session.username });
  return NextResponse.json({ isAdmin: !!a });
}
