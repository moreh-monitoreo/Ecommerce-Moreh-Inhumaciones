import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Variable de entorno requerida no definida: ${name}`);
  }
  return value;
}

function toBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  '';

interface DbConfig {
  url?: string;
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

function parseDbConfig(): DbConfig {
  if (databaseUrl) {
    const u = new URL(databaseUrl);
    return {
      url: databaseUrl,
      host: u.hostname,
      port: parseInt(u.port || '3306', 10),
      name: decodeURIComponent(u.pathname.replace(/^\//, '')) || 'railway',
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
    };
  }
  return {
    host: required('DB_HOST', 'localhost'),
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    name: required('DB_NAME', 'railway'),
    user: required('DB_USER', 'root'),
    password: required('DB_PASSWORD'),
  };
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5500')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  db: {
    ...parseDbConfig(),
    ssl: toBool(process.env.DB_SSL, false),
  },
};

export const isDev = env.nodeEnv === 'development';
