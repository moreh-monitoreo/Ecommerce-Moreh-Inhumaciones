import { sequelize } from '../models';
import { logger } from '../utils/logger';

async function main() {
  try {
    logger.info('Autenticando conexión con SQL Server...');
    await sequelize.authenticate();
    logger.info('Conexión OK. Sincronizando modelos (alter: true)...');
    await sequelize.sync({ alter: true });
    logger.info('Tablas sincronizadas correctamente.');
    process.exit(0);
  } catch (err) {
    logger.error('Error al sincronizar la base de datos:', err);
    process.exit(1);
  }
}

main();
