import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function projectData(data: Record<string, unknown>) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Solicitud inválida.");
  const nombre = typeof data.nombre === "string" ? data.nombre.trim() : "";
  const categoriaId = typeof data.categoriaId === "string" ? data.categoriaId : "";
  if (!nombre || nombre.length > 300 || !categoriaId) throw new Error("Nombre o categoría inválidos.");

  const optional = (field: string, max = 5000) => {
    const value = data[field];
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string" || value.trim().length > max) throw new Error("Los datos del proyecto no son válidos.");
    return value.trim();
  };
  const rawCount = data.numeroIntegrantes;
  const numeroIntegrantes = rawCount === null || rawCount === "" ? null : rawCount;
  if (numeroIntegrantes !== null && (!Number.isInteger(numeroIntegrantes) || (numeroIntegrantes as number) < 0 || (numeroIntegrantes as number) > 10000)) {
    throw new Error("Número de integrantes inválido.");
  }
  return {
    nombre, categoriaId, area: optional("area", 200), descripcion: optional("descripcion"), integrantesRaw: optional("integrantesRaw"),
    numeroIntegrantes: numeroIntegrantes as number | null, dimensiones: optional("dimensiones", 500), requerimientoTecnico: optional("requerimientoTecnico", 1000),
  };
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  let data;
  try { data = projectData(body as Record<string, unknown>); } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Datos inválidos." }, { status: 400 });
  }
  const categoria = await prisma.categoria.findUnique({ where: { id: data.categoriaId }, select: { id: true } });
  if (!categoria) return NextResponse.json({ error: "Categoría no encontrada." }, { status: 400 });
  const proyecto = await prisma.proyecto.create({ data });
  return NextResponse.json({ proyecto: { id: proyecto.id } }, { status: 201 });
}
