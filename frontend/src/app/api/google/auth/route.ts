import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const url = getGoogleAuthUrl(userId);
  return NextResponse.redirect(url);
}
