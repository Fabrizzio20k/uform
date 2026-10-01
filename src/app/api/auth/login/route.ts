import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createSessionToken,
  createSetPasswordToken,
  sessionCookieOptions,
  setPasswordCookieOptions,
  SESSION_COOKIE_NAME,
  SET_PASSWORD_COOKIE_NAME,
} from "@/lib/session";
import { getClientIp, isRateLimited, recordLoginAttempt } from "@/lib/rate-limit";

const GENERIC_ERROR = "Usuario y/o contraseña incorrecto.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo más tarde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: string; password?: string };

  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    await recordLoginAttempt(ip, typeof email === "string" ? email : null, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const jurado = await prisma.jurado.findUnique({ where: { email: normalizedEmail } });

  if (!jurado) {
    await recordLoginAttempt(ip, normalizedEmail, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // Primer inicio de sesión: el jurado aún no tiene contraseña establecida.
  // Se ignora el password enviado y se redirige automáticamente al flujo de
  // "establecer nueva contraseña", sin exponer si el email existe o no de
  // forma distinta al resto de errores (la respuesta es un caso propio, no
  // un error, ya que es el flujo esperado la primera vez).
  if (!jurado.passwordHash) {
    await recordLoginAttempt(ip, normalizedEmail, true);
    const token = await createSetPasswordToken(jurado.id, jurado.email);
    const response = NextResponse.json({ firstLogin: true });
    response.cookies.set(SET_PASSWORD_COOKIE_NAME, token, setPasswordCookieOptions);
    return response;
  }

  const isValid = verifyPassword(password, jurado.email, jurado.passwordHash);
  if (!isValid) {
    await recordLoginAttempt(ip, normalizedEmail, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await recordLoginAttempt(ip, normalizedEmail, true);
  const token = await createSessionToken(jurado.id, jurado.email);
  const response = NextResponse.json({
    firstLogin: false,
    jurado: { id: jurado.id, fullName: jurado.fullName, email: jurado.email },
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
