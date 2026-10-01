import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TipoRubrica } from "../src/generated/prisma/client.js";
import seedData from "./seed-data.json" with { type: "json" };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed: jurados...");
  for (const jurado of seedData.jurados) {
    await prisma.jurado.upsert({
      where: { email: jurado.email },
      update: {
        fullName: jurado.fullName,
        phone: jurado.phone,
        position: jurado.position,
        faculty: jurado.faculty,
      },
      create: {
        email: jurado.email,
        fullName: jurado.fullName,
        phone: jurado.phone,
        position: jurado.position,
        faculty: jurado.faculty,
      },
    });
  }
  console.log(`  ${seedData.jurados.length} jurados sedeados.`);

  console.log("Seed: rúbricas, criterios y categorías...");
  for (const rubricaData of seedData.rubricas) {
    const rubrica = await prisma.rubrica.upsert({
      where: { tipo: rubricaData.tipo as TipoRubrica },
      update: { nombre: rubricaData.nombre },
      create: { nombre: rubricaData.nombre, tipo: rubricaData.tipo as TipoRubrica },
    });

    const categoriaIdByNombre = new Map<string, string>();
    for (const nombreCategoria of rubricaData.categorias) {
      const categoria = await prisma.categoria.upsert({
        where: { nombre: nombreCategoria },
        update: { rubricaId: rubrica.id },
        create: { nombre: nombreCategoria, rubricaId: rubrica.id },
      });
      categoriaIdByNombre.set(nombreCategoria, categoria.id);
    }

    let orden = 0;
    for (const criterioData of rubricaData.criterios) {
      const criterio = await prisma.criterio.upsert({
        where: { rubricaId_nombre: { rubricaId: rubrica.id, nombre: criterioData.nombre } },
        update: { descripcion: criterioData.descripcion, orden },
        create: {
          nombre: criterioData.nombre,
          descripcion: criterioData.descripcion,
          orden,
          rubricaId: rubrica.id,
        },
      });
      orden++;

      for (const pesoData of criterioData.pesos) {
        const categoriaId = categoriaIdByNombre.get(pesoData.categoria);
        if (!categoriaId) {
          console.warn(
            `  Aviso: categoría "${pesoData.categoria}" no encontrada para criterio "${criterioData.nombre}".`
          );
          continue;
        }
        await prisma.pesoCriterioCategoria.upsert({
          where: { categoriaId_criterioId: { categoriaId, criterioId: criterio.id } },
          update: { peso: pesoData.peso },
          create: { categoriaId, criterioId: criterio.id, peso: pesoData.peso },
        });
      }
    }
  }
  console.log(`  ${seedData.rubricas.length} rúbricas sedeadas.`);

  console.log("Seed: proyectos...");
  const todasCategorias = await prisma.categoria.findMany();
  const categoriaIdByNombreGlobal = new Map(todasCategorias.map((c) => [c.nombre, c.id]));

  let proyectosCreados = 0;
  for (const proyecto of seedData.proyectos) {
    const categoriaId = categoriaIdByNombreGlobal.get(proyecto.categoria);
    if (!categoriaId) {
      console.warn(
        `  Aviso: proyecto "${proyecto.nombre}" tiene categoría "${proyecto.categoria}" no reconocida, se omite.`
      );
      continue;
    }

    const existente = await prisma.proyecto.findFirst({
      where: { nombre: proyecto.nombre, categoriaId },
    });
    if (existente) {
      await prisma.proyecto.update({
        where: { id: existente.id },
        data: {
          area: proyecto.area,
          descripcion: proyecto.descripcion,
          integrantesRaw: proyecto.integrantesRaw,
          numeroIntegrantes: proyecto.numeroIntegrantes,
          dimensiones: proyecto.dimensiones,
          requerimientoTecnico: proyecto.requerimientoTecnico,
        },
      });
    } else {
      await prisma.proyecto.create({
        data: {
          nombre: proyecto.nombre,
          area: proyecto.area,
          descripcion: proyecto.descripcion,
          integrantesRaw: proyecto.integrantesRaw,
          numeroIntegrantes: proyecto.numeroIntegrantes,
          dimensiones: proyecto.dimensiones,
          requerimientoTecnico: proyecto.requerimientoTecnico,
          categoriaId,
        },
      });
      proyectosCreados++;
    }
  }
  console.log(`  ${proyectosCreados} proyectos creados (de ${seedData.proyectos.length} en el archivo).`);

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
