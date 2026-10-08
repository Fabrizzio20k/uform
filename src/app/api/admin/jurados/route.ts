import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const data = body as Record<string, unknown>;
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  const fullName = typeof data?.fullName === "string" ? data.fullName.trim() : "";
  const assignedProjectIds = Array.isArray(data.assignedProjectIds) && data.assignedProjectIds.every((id) => typeof id === "string")
    ? [...new Set(data.assignedProjectIds)]
    : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !fullName || fullName.length > 200 || !assignedProjectIds) {
    return NextResponse.json({ error: "Ingresa un nombre y correo válidos." }, { status: 400 });
  }
  const optional = (field: string) => {
    const value = data[field];
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string" || value.trim().length > 200) throw new Error("Datos inválidos.");
    return value.trim();
  };
  let phone: string | null, position: string | null, faculty: string | null;
  try {
    phone = optional("phone"); position = optional("position"); faculty = optional("faculty");
  } catch {
    return NextResponse.json({ error: "Los datos adicionales no son válidos." }, { status: 400 });
  }
  try {
    const assignedProjects = await prisma.proyecto.count({ where: { id: { in: assignedProjectIds } } });
    if (assignedProjects !== assignedProjectIds.length) {
      return NextResponse.json({ error: "La selección de proyectos no es válida." }, { status: 400 });
    }
    const jurado = await prisma.jurado.create({
      data: { email, fullName, phone, position, faculty, role: "JURADO", asignaciones: { create: assignedProjectIds.map((proyectoId) => ({ proyectoId })) } },
      select: { id: true, email: true },
    });
    return NextResponse.json({ jurado }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ese correo ya está registrado." }, { status: 409 });
    }
    throw err;
  }
}
