import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // El CLI (migrate/db seed/studio) usa la conexión de sesión (puerto
    // 5432 del pooler de Supabase). El runtime de la app usa DATABASE_URL
    // (transaction pooler, puerto 6543) definido en src/lib/prisma.ts, más
    // apropiado para el modelo serverless de Vercel.
    url: env("DIRECT_URL"),
  },
});
