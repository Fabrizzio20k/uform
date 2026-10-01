import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { ADMIN_VIEW_COOKIE_NAME } from "@/lib/admin-view";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(ADMIN_VIEW_COOKIE_NAME);
  return response;
}
