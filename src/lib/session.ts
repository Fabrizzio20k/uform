import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

const SESSION_COOKIE = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

const SET_PASSWORD_COOKIE = "set_password_token";
const SET_PASSWORD_DURATION_SECONDS = 60 * 15; // 15 minutos para completar el flujo

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SET_PASSWORD_COOKIE_NAME = SET_PASSWORD_COOKIE;

type SessionPayload = {
  sub: string; // jurado id
  email: string;
  kind: "session";
};

type SetPasswordPayload = {
  sub: string; // jurado id
  email: string;
  kind: "set-password";
};

export async function createSessionToken(juradoId: string, email: string) {
  return new SignJWT({ sub: juradoId, email, kind: "session" } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

export async function createSetPasswordToken(juradoId: string, email: string) {
  return new SignJWT({
    sub: juradoId,
    email,
    kind: "set-password",
  } satisfies SetPasswordPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SET_PASSWORD_DURATION_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "session") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifySetPasswordToken(
  token: string
): Promise<SetPasswordPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "set-password") return null;
    return payload as unknown as SetPasswordPayload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};

export const setPasswordCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SET_PASSWORD_DURATION_SECONDS,
};
