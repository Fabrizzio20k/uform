import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/jurados/[id]">) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await ctx.params;
  const existing = await prisma.jurado.findUnique({ where: { id } });
  if (!existing || existing.role !== "JURADO") return NextResponse.json({ error: "Jurado no encontrado." }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const data = body as Record<string, unknown>;
  const fullName = typeof data?.fullName === "string" ? data.fullName.trim() : "";
  const assignedProjectIds = Array.isArray(data.assignedProjectIds) && data.assignedProjectIds.every((id) => typeof id === "string")
    ? [...new Set(data.assignedProjectIds)]
    : null;
  if (!fullName || fullName.length > 200 || typeof data.active !== "boolean" || !assignedProjectIds) {
    return NextResponse.json({ error: "Nombre o estado inválido." }, { status: 400 });
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
  const assignedProjects = await prisma.proyecto.count({ where: { id: { in: assignedProjectIds } } });
  if (assignedProjects !== assignedProjectIds.length) {
    return NextResponse.json({ error: "La selección de proyectos no es válida." }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.jurado.update({ where: { id }, data: { fullName, phone, position, faculty, active: data.active } }),
    prisma.asignacionProyecto.deleteMany({ where: { juradoId: id } }),
    ...(assignedProjectIds.length > 0 ? [prisma.asignacionProyecto.createMany({ data: assignedProjectIds.map((proyectoId) => ({ juradoId: id, proyectoId })) })] : []),
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/jurados/[id]">) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await ctx.params;
  const jurado = await prisma.jurado.findUnique({ where: { id }, select: { role: true } });
  if (!jurado || jurado.role !== "JURADO") return NextResponse.json({ error: "Jurado no encontrado." }, { status: 404 });
  const evaluaciones = await prisma.evaluacion.count({ where: { juradoId: id } });
  if (evaluaciones > 0) {
    return NextResponse.json({ error: "No se puede eliminar un jurado con evaluaciones registradas." }, { status: 409 });
  }
  await prisma.jurado.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
