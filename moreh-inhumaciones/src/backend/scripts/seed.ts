import { sequelize, Producto } from '../models';
import { logger } from '../utils/logger';
import type { CategoriaProducto } from '../models/Producto';

interface SeedProducto {
  nombre: string;
  precio: number;
  categoria: CategoriaProducto;
  material: string;
  imagen_url: string;
}

const productos: SeedProducto[] = [
  // Ataúdes
  { nombre: 'METALICO BÁSICO', precio: 24678, categoria: 'ataud', material: 'Metálico', imagen_url: '/img/METALICO BÁSICO.webp' },
  { nombre: 'METALICO MEDIO', precio: 32784, categoria: 'ataud', material: 'Metálico', imagen_url: '/img/METALICO MEDIO.webp' },
  { nombre: 'METALICO ECONÓMICO', precio: 19428, categoria: 'ataud', material: 'Metálico', imagen_url: '/img/METALICO ECONÓMICO.webp' },
  { nombre: 'MADERA CAOBA TP', precio: 39588, categoria: 'ataud', material: 'Madera Caoba', imagen_url: '/img/MADERA CAOBA TP.webp' },
  { nombre: 'METALICO DE LUJO', precio: 48228, categoria: 'ataud', material: 'Metálico', imagen_url: '/img/METALICO DE LUJO.webp' },
  { nombre: 'MADERA CONCAVO', precio: 48288, categoria: 'ataud', material: 'Madera', imagen_url: '/img/MADERA CONCAVO.webp' },
  { nombre: 'MADERA DE LUJO', precio: 53736, categoria: 'ataud', material: 'Madera', imagen_url: '/img/MADERA DE LUJO.webp' },
  { nombre: 'MADERA FINA TALLADA', precio: 64200, categoria: 'ataud', material: 'Madera Tallada', imagen_url: '/img/MADERA FINA TALLADA.webp' },
  // Urnas
  { nombre: 'URNA DE JARRÓN', precio: 1000, categoria: 'urna', material: 'Cerámica', imagen_url: '/img/URNA DE JARRÓN.webp' },
  { nombre: 'URNA DE MADERA DE LUJO', precio: 1000, categoria: 'urna', material: 'Madera', imagen_url: '/img/URNA DE MADERA DE LUJO .webp' },
  { nombre: 'URNA INFANTIL DE MADERA', precio: 1000, categoria: 'urna', material: 'Madera', imagen_url: '/img/URNA INFANTIL DE MADERA .webp' },
  { nombre: 'URNA DE MÁRMOL ROSA', precio: 1000, categoria: 'urna', material: 'Mármol', imagen_url: '/img/URNA DE MÁRMOL ROSA.webp' },
  { nombre: 'URNA DE MÁRMOL MARFIL', precio: 1000, categoria: 'urna', material: 'Mármol', imagen_url: '/img/URNA DE MÁRMOL MARFIL.webp' },
  { nombre: 'URNA DE ÓNIX BLANCO TORRE', precio: 1000, categoria: 'urna', material: 'Ónix', imagen_url: '/img/URNA DE ÓNIX BLANCO TORRE.webp' },
  { nombre: 'URNA DE ÓNIX ROSA CLÁSICA', precio: 1000, categoria: 'urna', material: 'Ónix', imagen_url: '/img/URNA DE ÓNIX ROSA CLÁSICA.webp' },
  { nombre: 'URNA DE MADERA BÁSICA NEGRO', precio: 1000, categoria: 'urna', material: 'Madera', imagen_url: '/img/URNA DE MADERA BÁSICA NEGRO.webp' },
];

async function main() {
  try {
    await sequelize.authenticate();
    logger.info('Conexión OK. Insertando productos...');

    let creados = 0;
    let existentes = 0;
    for (const p of productos) {
      const [, created] = await Producto.findOrCreate({
        where: { nombre: p.nombre },
        defaults: {
          nombre: p.nombre,
          descripcion: null,
          precio: p.precio,
          categoria: p.categoria,
          material: p.material,
          imagen_url: p.imagen_url,
          activo: true,
          stock: null,
        },
      });
      if (created) creados++;
      else existentes++;
    }

    logger.info(`Seed completado. Creados: ${creados}, ya existentes: ${existentes}`);
    process.exit(0);
  } catch (err) {
    logger.error('Error en seed:', err);
    process.exit(1);
  }
}

main();
