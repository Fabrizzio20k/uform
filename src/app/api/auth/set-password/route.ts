import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  createSessionToken,
  sessionCookieOptions,
  verifySetPasswordToken,
  SESSION_COOKIE_NAME,
  SET_PASSWORD_COOKIE_NAME,
} from "@/lib/session";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const setPasswordToken = request.cookies.get(SET_PASSWORD_COOKIE_NAME)?.value;
  if (!setPasswordToken) {
    return NextResponse.json(
      { error: "Sesión de establecimiento de contraseña inválida o expirada." },
      { status: 401 }
    );
  }

  const payload = await verifySetPasswordToken(setPasswordToken);
  if (!payload) {
    return NextResponse.json(
      { error: "Sesión de establecimiento de contraseña inválida o expirada." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { password, confirmPassword } = (body ?? {}) as {
    password?: string;
    confirmPassword?: string;
  };

  if (
    !password ||
    typeof password !== "string" ||
    !confirmPassword ||
    typeof confirmPassword !== "string"
  ) {
    return NextResponse.json({ error: "Ambos campos son obligatorios." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const jurado = await prisma.jurado.findUnique({ where: { id: payload.sub } });
  if (!jurado) {
    return NextResponse.json({ error: "Jurado no encontrado." }, { status: 404 });
  }

  // Si ya estableció contraseña entre que se emitió el token y ahora, no se
  // permite sobrescribirla por esta vía.
  if (jurado.passwordHash) {
    return NextResponse.json(
      { error: "Ya se estableció una contraseña para este usuario." },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(password, jurado.email);
  await prisma.jurado.update({
    where: { id: jurado.id },
    data: { passwordHash, passwordSetAt: new Date() },
  });

  const sessionToken = await createSessionToken(jurado.id, jurado.email);
  const response = NextResponse.json({
    jurado: { id: jurado.id, fullName: jurado.fullName, email: jurado.email },
  });
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions);
  response.cookies.delete(SET_PASSWORD_COOKIE_NAME);
  return response;
}
