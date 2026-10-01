"use client";

import { useEffect, useState } from "react";
import { AppFooter } from "@/components/app-footer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FilaRanking = {
  proyectoId: string;
  nombre: string;
  categoria: { id: string; nombre: string };
  puntajeTotal: number;
  numeroEvaluaciones: number;
};

type LeaderboardData = {
  rankingGlobal: FilaRanking[];
  rankingPorCategoria: { categoria: string; proyectos: FilaRanking[] }[];
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) {
        setError("No se pudo cargar el leaderboard.");
        return;
      }
      const result: LeaderboardData = await res.json();
      setData(result);
    }
    load();
  }, []);

  const filas: FilaRanking[] | undefined = data
    ? categoriaActiva
      ? data.rankingPorCategoria.find((c) => c.categoria === categoriaActiva)?.proyectos
      : data.rankingGlobal
    : undefined;

  return (
    <>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        <h1 className="mb-4 text-lg font-medium">Leaderboard</h1>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!data && !error && <p className="text-sm text-muted-foreground">Cargando...</p>}

        {data && (
          <>
            <div className="mb-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoriaActiva(null)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  categoriaActiva === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Global
              </button>
              {data.rankingPorCategoria.map((c) => (
                <button
                  key={c.categoria}
                  onClick={() => setCategoriaActiva(c.categoria)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    categoriaActiva === c.categoria
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.categoria}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Proyecto</TableHead>
                    {categoriaActiva === null && (
                      <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                    )}
                    <TableHead className="text-right">Puntaje</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Evals.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas?.map((fila, index) => (
                    <TableRow key={fila.proyectoId}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {fila.nombre}
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-2">
                            Ganador
                          </Badge>
                        )}
                        {categoriaActiva === null && (
                          <span className="block truncate text-xs text-muted-foreground sm:hidden">
                            {fila.categoria.nombre}
                          </span>
                        )}
                      </TableCell>
                      {categoriaActiva === null && (
                        <TableCell className="hidden sm:table-cell">
                          {fila.categoria.nombre}
                        </TableCell>
                      )}
                      <TableCell className="text-right font-medium">
                        {fila.puntajeTotal.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                        {fila.numeroEvaluaciones}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filas?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Aún no hay evaluaciones registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>
      <AppFooter />
    </>
  );
}
