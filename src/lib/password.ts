import { createHash } from "crypto";

/**
 * Hash de contraseña con SHA-256. Se usa un salt fijo por usuario (su propio
 * email en minúsculas) concatenado a la contraseña antes de hashear, para
 * evitar que contraseñas idénticas entre distintos jurados generen el mismo
 * hash. Es una medida simple, acorde al alcance pedido (sin bcrypt/argon2).
 */
export function hashPassword(password: string, email: string): string {
  const salt = email.trim().toLowerCase();
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function verifyPassword(
  password: string,
  email: string,
  hash: string
): boolean {
  return hashPassword(password, email) === hash;
}
