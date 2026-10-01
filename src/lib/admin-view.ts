export const ADMIN_VIEW_COOKIE_NAME = "admin_view";

export type AdminView = "admin" | "jurado";

export function adminViewFromCookie(value: string | undefined): AdminView {
  return value === "jurado" ? "jurado" : "admin";
}
