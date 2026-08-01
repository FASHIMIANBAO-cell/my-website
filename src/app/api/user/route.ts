import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { user, admin } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ loggedIn: false, isAdmin: false });
  }
  const u = user.findUnique({ username: session.username });
  const a = admin.findUnique({ username: session.username });
  return NextResponse.json({
    loggedIn: true,
    username: u?.username || session.username,
    displayName: u?.displayName || session.username,
    avatar: u?.avatar || "",
    isAdmin: !!a,
  });
}
