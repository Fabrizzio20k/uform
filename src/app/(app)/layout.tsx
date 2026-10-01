import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { resolveJurado } from "@/lib/resolve-jurado";
import { AppHeader } from "@/components/app-header";
import { ADMIN_VIEW_COOKIE_NAME, adminViewFromCookie } from "@/lib/admin-view";

// Resuelve la sesión en el servidor (sin fetch en el cliente) para que el
// nombre del jurado y el estado de "ingresado" aparezcan ya resueltos en el
// primer render del header, sin parpadeo al navegar entre páginas. Si el JWT
// es válido pero el jurado ya no existe (p. ej. tras un reset de la DB en
// desarrollo), resolveJurado() devuelve null y el header se muestra como
// "sin sesión". La cookie en sí se limpia en el proxy (src/proxy.ts) o en
// /api/auth/logout, ya que Next.js no permite mutar cookies durante el
// render de un Server Component.
async function getJurado() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const jurado = await resolveJurado(token);
  const adminView = adminViewFromCookie(cookieStore.get(ADMIN_VIEW_COOKIE_NAME)?.value);
  return { jurado, adminView };
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { jurado, adminView } = await getJurado();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader juradoName={jurado?.fullName} role={jurado?.role} adminView={adminView} />
      {children}
    </div>
  );
}
