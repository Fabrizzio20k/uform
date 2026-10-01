import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { resolveJurado } from "@/lib/resolve-jurado";
import { ADMIN_VIEW_COOKIE_NAME, adminViewFromCookie } from "@/lib/admin-view";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const jurado = await resolveJurado(token);

  const adminView = adminViewFromCookie(cookieStore.get(ADMIN_VIEW_COOKIE_NAME)?.value);
  redirect(jurado ? (jurado.role === "ADMIN" && adminView === "admin" ? "/admin" : "/proyectos") : "/login");
}
