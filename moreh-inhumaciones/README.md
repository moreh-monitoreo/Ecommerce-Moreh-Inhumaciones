# Moreh Inhumaciones — Backend API

Backend REST para el sitio Moreh Inhumaciones construido con **Express + TypeScript + Sequelize + SQL Server**.

## Requisitos

- Node.js 18+ y npm
- SQL Server 2019+ accesible (local o remoto)
- Usuario SQL con permisos para crear tablas

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

DB_HOST=localhost
DB_PORT=1433
DB_NAME=moreh_db
DB_USER=sa
DB_PASSWORD=TU_PASSWORD
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
DB_INSTANCE=
```

> Si usas una instancia con nombre (ej. `SQLEXPRESS`), pon `DB_INSTANCE=SQLEXPRESS`.

### 3. Crear la base de datos

Ejecuta el script SQL contra tu instancia:

```bash
sqlcmd -S localhost -U sa -P TU_PASSWORD -i src/backend/scripts/create-database.sql
```

O abre [src/backend/scripts/create-database.sql](src/backend/scripts/create-database.sql) en SSMS y ejecútalo.

### 4. Sincronizar tablas

```bash
npm run db:sync
```

Crea las tablas: `Productos`, `Contactos`, `Cotizaciones`, `CotizacionItems`.

### 5. Poblar datos iniciales

```bash
npm run db:seed
```

Inserta los 16 productos (ataúdes y urnas) del catálogo actual.

### 6. Arrancar el servidor

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
