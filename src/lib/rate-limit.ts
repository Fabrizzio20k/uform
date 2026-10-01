import { prisma } from "@/lib/prisma";

// Ventana y límites simples de rate-limit para el login, respaldados en la
// tabla login_attempts (sin infraestructura adicional como Redis).
const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS_PER_IP = 20;

/**
 * Verifica si una IP ya superó el máximo de intentos de login permitidos
 * dentro de la ventana de tiempo. No distingue éxito/fracaso: cualquier
 * intento cuenta, para frenar tanto fuerza bruta como ráfagas tipo DDoS
 * contra el endpoint de login.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const count = await prisma.loginAttempt.count({
    where: { ip, createdAt: { gte: windowStart } },
  });
  return count >= MAX_ATTEMPTS_PER_IP;
}

export async function recordLoginAttempt(
  ip: string,
  email: string | null,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { ip, email, success },
  });
}

/**
 * Extrae la IP del cliente a partir de los headers estándar de proxy
 * (Vercel, Nginx, etc). Cae a "unknown" si no se puede determinar, lo cual
 * agrupa tráfico sin IP identificable bajo un mismo bucket de rate-limit.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
