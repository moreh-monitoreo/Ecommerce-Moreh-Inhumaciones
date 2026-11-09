# Moreh Inhumaciones — Backend API

Backend REST para el sitio Moreh Inhumaciones construido con **Express + TypeScript + Sequelize + MySQL**.

## Requisitos

- Node.js 18+ y npm
- MySQL 8+ accesible (local, remoto o Railway)
- Usuario MySQL con permisos para crear tablas

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta credenciales:

```bash
cp .env.example .env
```

```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500

# Opción A: URL de conexión (recomendado con Railway)
DATABASE_URL=mysql://root:PASSWORD@host:3306/railway

# Opción B: variables sueltas (se ignoran si DATABASE_URL está definida)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=TU_PASSWORD
DB_SSL=false
```

> En Railway, en el servicio del backend define `DATABASE_URL` como referencia:
> `${{ MySQL.MYSQL_URL }}` (red interna). Para conectarte desde tu máquina usa
> `${{ MySQL.MYSQL_PUBLIC_URL }}` (proxy TCP público).

### 3. Sincronizar tablas

```bash
npm run db:sync
```

Crea todas las tablas a partir de los modelos Sequelize (`sequelize.sync({ alter: true })`).

### 4. Poblar datos iniciales

```bash
npm run db:seed        # 16 productos del catálogo (ataúdes y urnas)
npm run db:seed-admin  # roles, permisos, SuperAdmin y sucursales
```

### 5. Arrancar el servidor

Modo desarrollo (hot reload):

```bash
npm run dev
```

Modo producción:

```bash
npm run build
npm start
```

El servidor escucha por defecto en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Healthcheck (uptime + estado DB) |
| GET | `/api/productos` | Lista productos activos |
| GET | `/api/productos?categoria=urna` | Filtra por categoría (`ataud` o `urna`) |
| GET | `/api/productos?search=caoba` | Búsqueda por nombre |
| GET | `/api/productos/:id` | Detalle de producto |
| POST | `/api/contactos` | Crea mensaje de contacto |
| POST | `/api/cotizaciones` | Crea cotización (total se calcula server-side) |
| GET | `/api/cotizaciones/:id` | Detalle de cotización con items |

### Ejemplos

**POST /api/contactos**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "6671234567",
  "mensaje": "Quisiera información sobre servicios"
}
```

**POST /api/cotizaciones**
```json
{
  "cliente": {
    "nombre": "Ana Ruiz",
    "email": "ana@example.com",
    "telefono": "6670000000"
  },
  "items": [
    { "producto_id": 1, "cantidad": 1 },
    { "producto_id": 9, "cantidad": 2 }
  ]
}
```

El backend ignora cualquier precio enviado por el cliente; toma el precio real de cada `producto_id` desde la BD y calcula `subtotal` y `total`.

## Estructura

```
src/backend/
├── index.ts              # entrada: conecta a DB y arranca server
├── app.ts                # Express + middlewares + routers
├── config/               # env y conexión Sequelize
├── models/               # modelos Sequelize y asociaciones
├── routers/              # rutas Express
├── controllers/          # controladores thin
├── services/             # lógica de negocio (transacciones, cálculos)
├── middlewares/          # errorHandler, notFound, validate
├── validators/           # cadenas express-validator
├── types/                # DTOs e interfaces TS
├── utils/                # HttpError, logger
└── scripts/              # sync.ts, seed.ts, create-database.sql
```

## Scripts npm

- `npm run dev` — arranca con `ts-node-dev` (hot reload)
- `npm run build` — compila TS a `dist/`
- `npm start` — corre el código compilado
- `npm run db:sync` — `sequelize.sync({ alter: true })`
- `npm run db:seed` — inserta productos iniciales (idempotente)

## Notas

- **Sin auth**: la API es pública. Para producción se recomienda añadir `express-rate-limit` y autenticación admin (JWT) para endpoints de gestión.
- **Migraciones**: se usa `sequelize.sync({alter:true})` en desarrollo. Para producción, migrar a `sequelize-cli` con migrations versionadas.
- **CORS**: la variable `CORS_ORIGIN` admite múltiples orígenes separados por coma.
