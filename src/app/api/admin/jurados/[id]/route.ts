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
  if (!fullName || fullName.length > 200 || typeof data.active !== "boolean") {
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
  await prisma.jurado.update({ where: { id }, data: { fullName, phone, position, faculty, active: data.active } });
  return NextResponse.json({ ok: true });
}
