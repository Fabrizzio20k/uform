import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited, recordLoginAttempt } from "@/lib/rate-limit";
import { createSetPasswordToken, setPasswordCookieOptions, SET_PASSWORD_COOKIE_NAME } from "@/lib/session";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta de nuevo más tarde." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const email = typeof (body as { email?: unknown })?.email === "string" ? (body as { email: string }).email.trim().toLowerCase() : "";
  const jurado = email ? await prisma.jurado.findUnique({ where: { email } }) : null;
  if (!jurado?.active || !jurado.passwordHash) {
    await recordLoginAttempt(ip, email || null, false);
    return NextResponse.json({ error: "No se encontró una cuenta activa con ese correo." }, { status: 404 });
  }
  await recordLoginAttempt(ip, email, true);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SET_PASSWORD_COOKIE_NAME, await createSetPasswordToken(jurado.id, jurado.email, "password-reset"), setPasswordCookieOptions);
  return response;
}
