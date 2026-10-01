import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";

/**
 * Verifica el JWT de sesión Y confirma que el jurado siga existiendo en la
 * base de datos. Es necesario además de verifySessionToken() porque un JWT
 * puede seguir siendo criptográficamente válido (firmado con el mismo
 * SESSION_SECRET) aunque la base de datos se haya reseteado o el jurado ya
 * no exista (p. ej. tras `npm run db:reset` en desarrollo).
 */
export async function resolveJurado(token: string | undefined) {
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const jurado = await prisma.jurado.findUnique({
    where: { id: payload.sub },
    select: { id: true, fullName: true, email: true },
  });

  return jurado;
}
