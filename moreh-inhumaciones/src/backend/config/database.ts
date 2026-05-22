import { Sequelize } from 'sequelize';
import { env, isDev } from './env';

const dialectOptions: Record<string, unknown> = {
  options: {
    encrypt: env.db.encrypt,
    trustServerCertificate: env.db.trustServerCertificate,
    ...(env.db.instance ? { instanceName: env.db.instance } : {}),
  },
};

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mssql',
  dialectOptions,
  logging: false,
  define: {
    freezeTableName: false,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
