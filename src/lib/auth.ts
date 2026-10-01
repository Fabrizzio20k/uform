import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * Devuelve el payload de sesión si la cookie es válida, o null si no hay
 * sesión / es inválida. Los route handlers deciden qué responder en cada
 * caso (401, etc).
 */
export async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const jurado = await prisma.jurado.findUnique({
    where: { id: session.sub },
    select: { active: true },
  });
  return jurado?.active ? session : null;
}
