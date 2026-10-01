import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Devuelve el payload de sesión si la cookie es válida, o null si no hay
 * sesión / es inválida. Los route handlers deciden qué responder en cada
 * caso (401, etc).
 */
export async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
