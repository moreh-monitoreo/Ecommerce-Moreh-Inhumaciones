import app from './app';
import { sequelize } from './models';
import { env, isDev } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    logger.info('Conectando a SQL Server...');
    await sequelize.authenticate();
    logger.info('Conexión a base de datos OK.');

    if (isDev) {
      logger.info('Sincronizando modelos (dev mode)...');
      await sequelize.sync();
    }

    const server = app.listen(env.port, '0.0.0.0', () => {
      logger.info(`Servidor escuchando en http://0.0.0.0:${env.port}`);
      logger.info(`Entorno: ${env.nodeEnv}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Recibida señal ${signal}. Cerrando...`);
      server.close(async () => {
        await sequelize.close();
        logger.info('Servidor cerrado correctamente.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

bootstrap();
