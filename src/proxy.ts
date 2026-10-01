import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { resolveJurado } from "@/lib/resolve-jurado";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/proyectos/:path*", "/perfil"],
};
