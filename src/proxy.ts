import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { resolveJurado } from "@/lib/resolve-jurado";
import { ADMIN_VIEW_COOKIE_NAME, adminViewFromCookie } from "@/lib/admin-view";

// Protege /proyectos y /perfil a nivel de servidor: sin sesión válida (JWT
// firmado Y jurado existente en la base de datos), redirige a /login antes
// de que la ruta se renderice, limpiando cualquier cookie obsoleta.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const jurado = await resolveJurado(token);

  if (!jurado) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const adminView = adminViewFromCookie(request.cookies.get(ADMIN_VIEW_COOKIE_NAME)?.value);

  if (request.nextUrl.pathname.startsWith("/admin") && jurado.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/proyectos", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && adminView === "jurado") {
    return NextResponse.redirect(new URL("/proyectos", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/proyectos") && jurado.role === "ADMIN" && adminView === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/proyectos/:path*", "/perfil", "/admin/:path*"],
};
