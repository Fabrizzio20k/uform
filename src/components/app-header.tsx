"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Trophy, LogOut, LogIn, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AdminView } from "@/lib/admin-view";

const NAV_ITEMS = [
  { href: "/proyectos", label: "Proyectos", icon: LayoutGrid },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppHeader({
  juradoName,
  role,
  adminView = "admin",
}: {
  juradoName?: string;
  role?: "ADMIN" | "JURADO";
  adminView?: AdminView;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const isAdminView = role === "ADMIN" && adminView === "admin";
  const navItems = NAV_ITEMS.filter((item) => item.href !== "/leaderboard" || role === "ADMIN").filter((item) => !isAdminView || item.href !== "/proyectos");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleSwitchView() {
    const view = adminView === "admin" ? "jurado" : "admin";
    setSwitching(true);
    setSwitchError("");
    try {
      const response = await fetch("/api/admin/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ view }),
      });
      if (!response.ok) throw new Error();
      const data: { destination: string } = await response.json();
      window.location.assign(data.destination);
    } catch {
      setSwitchError("No se pudo cambiar de vista.");
      setSwitching(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-background/95 px-4 py-3.5 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:px-6 lg:px-8">
      <div className="order-1 flex min-w-0 flex-1 items-center gap-2">
        {role === "ADMIN" && (
          <Button variant="outline" size="sm" onClick={handleSwitchView} disabled={switching}>
            {adminView === "admin" ? <LayoutGrid className="size-4" /> : <Shield className="size-4" />}
            {switching ? "Cambiando…" : adminView === "admin" ? "Ver como jurado" : "Ver como admin"}
          </Button>
        )}
        {switchError && <span role="alert" className="text-xs text-destructive">{switchError}</span>}
      </div>

      <nav className="order-3 flex w-full max-w-full items-center justify-center gap-1 overflow-x-auto rounded-full border bg-muted/40 p-1 sm:order-2 sm:w-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
        {isAdminView && (
          <Link
            href="/admin"
            aria-label="Administración"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === "/admin"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="size-4" />
            <span className="hidden sm:inline">Administración</span>
          </Link>
        )}
        <ThemeToggle className="ml-1 rounded-full border-none shadow-none" />
        {juradoName && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={handleLogout}
            aria-label="Salir"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </nav>

      <div className="order-2 flex flex-1 items-center justify-end gap-2 text-sm sm:order-3">
        {!juradoName && (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <LogIn className="size-4" />
            <span className="hidden sm:inline">Ingresar</span>
          </Link>
        )}
      </div>
    </header>
  );
}
