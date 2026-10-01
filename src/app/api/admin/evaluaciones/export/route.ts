import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const evaluaciones = await prisma.evaluacion.findMany({
    include: { jurado: true, proyecto: { include: { categoria: true } }, puntajes: { include: { criterio: true } } },
    orderBy: { createdAt: "asc" },
  });
  const rows: unknown[][] = [["Evaluación ID", "Fecha", "Jurado", "Correo", "Proyecto", "Categoría", "Puntaje total", "Criterio", "Puntaje"]];
  for (const ev of evaluaciones) {
    const base = [ev.id, ev.createdAt.toISOString(), ev.jurado.fullName, ev.jurado.email, ev.proyecto.nombre, ev.proyecto.categoria.nombre, ev.scoreTotal];
    for (const p of ev.puntajes) rows.push([...base, p.criterio.nombre, p.puntaje]);
  }
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="evaluaciones.csv"',
      "Cache-Control": "no-store",
    },
  });
}
