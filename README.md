This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Base de datos y administradores

Configura `DIRECT_URL` (conexión de sesión para Prisma CLI) y `DATABASE_URL` (conexión de la aplicación y el seed) en `.env`. Ejecuta `npm run db:generate` después de instalar dependencias.

El seed registra a `ahidalgod@utec.edu.pe`, `fabrizzio785@gmail.com` y `fabrizzio.vilchez.e@utec.edu.pe` como administradores. Al ingresar por primera vez, cada uno establece su propia contraseña igual que un jurado. Un admin puede alternar entre **Ver como admin** y **Ver como jurado** desde el encabezado. En la vista jurado usa su propia cuenta para evaluar proyectos; cada cuenta puede evaluar un proyecto una sola vez y varios jurados pueden evaluar el mismo proyecto. Las cuentas desactivadas no pueden ingresar ni evaluar.

El panel `/admin` permite registrar, editar y desactivar jurados; corregir datos de proyectos; consultar puntajes; exportar las evaluaciones vigentes a CSV; y anular una evaluación con motivo para que el jurado pueda enviarla de nuevo. Una anulación guarda una copia de los puntajes originales y retira la evaluación del ranking. La categoría de un proyecto no se puede cambiar después de recibir evaluaciones. Los correos de jurados no se pueden cambiar tras el alta porque forman parte del hash de su contraseña. Las asignaciones jurado–proyecto siguen pendientes de definición en `PENDIENTES.md`.

Para actualizar una base existente sin borrar datos, ejecuta `npx prisma migrate deploy` y `npm run db:generate`.

`npm run db:reset` elimina todos los datos de la base configurada, aplica las migraciones y vuelve a ejecutar el seed. Úsalo únicamente con una base de desarrollo.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
