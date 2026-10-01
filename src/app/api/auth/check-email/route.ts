import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited, recordLoginAttempt } from "@/lib/rate-limit";
import { createSetPasswordToken, setPasswordCookieOptions, SET_PASSWORD_COOKIE_NAME } from "@/lib/session";

const GENERIC_ERROR = "Usuario y/o contraseña incorrecto.";

// Primer paso del login: solo recibe el correo. No revela si el correo
// existe o no de forma distinguible en el mensaje (siempre el mismo error
// genérico), pero indica al frontend si debe pedir contraseña o iniciar el
// flujo de "establecer contraseña por primera vez".
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

  const { email } = (body ?? {}) as { email?: string };
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const jurado = await prisma.jurado.findUnique({ where: { email: normalizedEmail } });

  if (!jurado) {
    await recordLoginAttempt(ip, normalizedEmail, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!jurado.passwordHash) {
    // Primera vez: se emite directamente el token de set-password, igual que
    // en /api/auth/login, para no tener que repetir esta consulta luego.
    await recordLoginAttempt(ip, normalizedEmail, true);
    const token = await createSetPasswordToken(jurado.id, jurado.email);
    const response = NextResponse.json({ firstLogin: true });
    response.cookies.set(SET_PASSWORD_COOKIE_NAME, token, setPasswordCookieOptions);
    return response;
  }

  return NextResponse.json({ firstLogin: false });
}
