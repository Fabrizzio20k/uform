import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { admin: null, error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  }
  const admin = await prisma.jurado.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true },
  });
  if (admin?.role !== "ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Acceso de administrador requerido." }, { status: 403 }) };
  }
  return { admin, error: null };
}
