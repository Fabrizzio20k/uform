import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ jurado: null }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ jurado: null }, { status: 401 });
  }

  const jurado = await prisma.jurado.findUnique({
    where: { id: payload.sub },
    select: { id: true, fullName: true, email: true },
  });

  if (!jurado) {
    return NextResponse.json({ jurado: null }, { status: 401 });
  }

  return NextResponse.json({ jurado });
}
