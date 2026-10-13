"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { AppFooter } from "@/components/app-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type ModoPuntaje = "acumulado" | "promedio";
type OrdenPuntaje = "desc" | "asc";

function ordenarFilas(filas: FilaRanking[], modoPuntaje: ModoPuntaje, ordenPuntaje: OrdenPuntaje) {
  return [...filas].sort((a, b) => {
    const puntajeA = modoPuntaje === "acumulado" ? a.puntajeTotal : a.puntajeTotal / a.numeroEvaluaciones;
    const puntajeB = modoPuntaje === "acumulado" ? b.puntajeTotal : b.puntajeTotal / b.numeroEvaluaciones;
    return ordenPuntaje === "desc" ? puntajeB - puntajeA : puntajeA - puntajeB;
  });
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [modoPuntaje, setModoPuntaje] = useState<ModoPuntaje>("acumulado");
  const [ordenPuntaje, setOrdenPuntaje] = useState<OrdenPuntaje>("desc");
  const [infoAbierta, setInfoAbierta] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          router.push("/proyectos");
          return;
        }
        setError("No se pudo cargar el leaderboard.");
        return;
      }
      const result: LeaderboardData = await res.json();
      setData(result);
    }
    load();
  }, [router]);

  const filasSinOrdenar: FilaRanking[] | undefined = data
    ? categoriaActiva
      ? data.rankingPorCategoria.find((c) => c.categoria === categoriaActiva)?.proyectos
      : data.rankingGlobal
    : undefined;
  const filas = filasSinOrdenar ? ordenarFilas(filasSinOrdenar, modoPuntaje, ordenPuntaje) : undefined;
  const usandoPromedio = modoPuntaje === "promedio";

  return (
    <>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-medium">Leaderboard</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Cómo se calculan los puntajes"
              onClick={() => setInfoAbierta(true)}
            >
              <CircleHelp className="size-4" />
            </Button>
            <button
              type="button"
              role="switch"
              aria-checked={usandoPromedio}
              aria-label="Usar promedio por evaluación registrada"
              onClick={() => setModoPuntaje((modo) => modo === "acumulado" ? "promedio" : "acumulado")}
              className={cn(
                "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
                usandoPromedio ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Promedio por evaluación</span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
                  usandoPromedio ? "bg-primary-foreground/30" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "size-3 rounded-full bg-background shadow-xs transition-transform",
                    usandoPromedio && "translate-x-3"
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!data && !error && <p className="text-sm text-muted-foreground">Cargando...</p>}

        {data && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
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
              <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 text-xs font-medium">
                <span className="px-2 text-muted-foreground">Orden</span>
                <button
                  type="button"
                  onClick={() => setOrdenPuntaje("desc")}
                  className={cn(
                    "rounded-md px-2 py-1.5 transition-colors",
                    ordenPuntaje === "desc" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mayor a menor
                </button>
                <button
                  type="button"
                  onClick={() => setOrdenPuntaje("asc")}
                  className={cn(
                    "rounded-md px-2 py-1.5 transition-colors",
                    ordenPuntaje === "asc" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Menor a mayor
                </button>
              </div>
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
                    <TableHead className="text-right">{usandoPromedio ? "Promedio" : "Puntaje"}</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Evals.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas?.map((fila, index) => (
                    <TableRow key={fila.proyectoId}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="min-w-48 whitespace-normal font-medium">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="break-words">{fila.nombre}</span>
                          {index === 0 && ordenPuntaje === "desc" && (
                            <Badge variant="secondary">
                              Ganador
                            </Badge>
                          )}
                        </div>
                        {categoriaActiva === null && (
                          <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
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
                        {(usandoPromedio ? fila.puntajeTotal / fila.numeroEvaluaciones : fila.puntajeTotal).toFixed(2)}
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
      <Dialog open={infoAbierta} onOpenChange={setInfoAbierta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Formas de calcular el leaderboard</DialogTitle>
            <DialogDescription className="space-y-3">
              <span className="block">
                <strong className="text-foreground">Puntaje acumulado.</strong>{" "}
                Suma el puntaje final de cada evaluación registrada. Esta es la vista predeterminada.
              </span>
              <span className="block">
                <strong className="text-foreground">Promedio por evaluación.</strong>{" "}
                Divide el puntaje acumulado entre las evaluaciones registradas. Sirve para comparar los proyectos cuando, por una situación excepcional, no todos tuvieron acceso a la misma cantidad de jurados. No asume evaluaciones que no existen.
              </span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <AppFooter />
    </>
  );
}
