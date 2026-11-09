import { Sequelize, Options } from 'sequelize';
import { env } from './env';

const dialectOptions: Record<string, unknown> = {
  // Devuelve DECIMAL/BIGINT como number cuando es seguro (evita strings sorpresa).
  decimalNumbers: true,
  ...(env.db.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
};

const common: Options = {
  dialect: 'mysql',
  dialectOptions,
  logging: false,
  timezone: '+00:00',
  define: {
    freezeTableName: false,
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export const sequelize = env.db.url
  ? new Sequelize(env.db.url, common)
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      ...common,
      host: env.db.host,
      port: env.db.port,
    });
