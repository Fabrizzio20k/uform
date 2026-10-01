"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Briefcase, Building2 } from "lucide-react";
import { AppFooter } from "@/components/app-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PerfilData = {
  jurado: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    position: string | null;
    faculty: string | null;
  };
  evaluaciones: {
    id: string;
    scoreTotal: string;
    proyecto: { id: string; nombre: string; categoria: string };
  }[];
};

export default function PerfilPage() {
  const router = useRouter();
  const [data, setData] = useState<PerfilData | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/perfil");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      setData(await res.json());
    }
    load();
  }, [router]);

  return (
    <>
      <main className="mx-auto w-full max-w-2xl flex-1 p-4">
        {!data && <p className="text-sm text-muted-foreground">Cargando...</p>}

        {data && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{data.jurado.fullName}</CardTitle>
                <CardDescription>Datos registrados por la organización</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  {data.jurado.email}
                </div>
                {data.jurado.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    {data.jurado.phone}
                  </div>
                )}
                {data.jurado.position && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="size-4" />
                    {data.jurado.position}
                  </div>
                )}
                {data.jurado.faculty && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="size-4" />
                    {data.jurado.faculty}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones realizadas</CardTitle>
                <CardDescription>
                  {data.evaluaciones.length} proyecto(s) evaluado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.evaluaciones.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aún no has evaluado ningún proyecto.
                  </p>
                )}
                {data.evaluaciones.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{ev.proyecto.nombre}</p>
                      <p className="text-xs text-muted-foreground">{ev.proyecto.categoria}</p>
                    </div>
                    <Badge variant="secondary">{Number(ev.scoreTotal).toFixed(2)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <AppFooter />
    </>
  );
}
