import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_VIEW_COOKIE_NAME } from "@/lib/admin-view";
import { sessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const view = (body as { view?: unknown })?.view;
  if (view !== "admin" && view !== "jurado") {
    return NextResponse.json({ error: "Vista inválida." }, { status: 400 });
  }

  const response = NextResponse.json({ destination: view === "jurado" ? "/proyectos" : "/admin" });
  if (view === "admin") response.cookies.delete(ADMIN_VIEW_COOKIE_NAME);
  else response.cookies.set(ADMIN_VIEW_COOKIE_NAME, "jurado", sessionCookieOptions);
  return response;
}
