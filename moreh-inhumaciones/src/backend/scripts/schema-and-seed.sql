/* =============================================================================
   Moreh Inhumaciones — Esquema completo + Datos iniciales
   SQL Server 2019+
   -----------------------------------------------------------------------------
   Ejecución:
     sqlcmd -S localhost -U sa -P <password> -i schema-and-seed.sql
   O abrir en SSMS y ejecutar todo.
   -----------------------------------------------------------------------------
   Contiene:
     1) CREATE DATABASE moreh_db (si no existe)
     2) CREATE TABLE: Productos, Contactos, Cotizaciones, CotizacionItems
     3) INSERT de los 17 productos extraídos de sitio-original/productos
   ============================================================================= */

------------------------------------------------------------------------------
-- 1. Crear base de datos
--    NOTA Azure SQL: comentar las líneas de abajo — la DB ya existe en Azure
--    y USE no está soportado. Conectarse directamente a moreh_db en SSMS.
------------------------------------------------------------------------------
-- IF DB_ID('moreh_db') IS NULL
-- BEGIN
--     CREATE DATABASE moreh_db;
--     PRINT 'Base de datos moreh_db creada.';
-- END
-- ELSE
--     PRINT 'La base de datos moreh_db ya existe.';
-- GO

-- USE moreh_db;
-- GO

------------------------------------------------------------------------------
-- 2. Tablas
------------------------------------------------------------------------------

-- Tabla Productos -------------------------------------------------------------
IF OBJECT_ID('dbo.Productos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Productos (
        id            INT IDENTITY(1,1) NOT NULL,
        nombre        NVARCHAR(150)     NOT NULL,
        descripcion   NVARCHAR(MAX)     NULL,
        precio        DECIMAL(10, 2)    NOT NULL,
        categoria     NVARCHAR(20)      NOT NULL,
        material      NVARCHAR(80)      NULL,
        imagen_url    NVARCHAR(255)     NULL,
        activo        BIT               NOT NULL CONSTRAINT DF_Productos_activo DEFAULT (1),
        stock         INT               NULL,
        createdAt     DATETIME2(3)      NOT NULL CONSTRAINT DF_Productos_createdAt DEFAULT (SYSUTCDATETIME()),
        updatedAt     DATETIME2(3)      NOT NULL CONSTRAINT DF_Productos_updatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Productos PRIMARY KEY (id),
        CONSTRAINT CK_Productos_categoria CHECK (categoria IN (N'ataud', N'urna')),
        CONSTRAINT UQ_Productos_nombre   UNIQUE (nombre)
    );
    PRINT 'Tabla Productos creada.';
END
GO

-- Tabla Contactos -------------------------------------------------------------
IF OBJECT_ID('dbo.Contactos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contactos (
        id          INT IDENTITY(1,1) NOT NULL,
        nombre      NVARCHAR(120)     NOT NULL,
        email       NVARCHAR(150)     NOT NULL,
        telefono    NVARCHAR(30)      NULL,
        mensaje     NVARCHAR(MAX)     NOT NULL,
        createdAt   DATETIME2(3)      NOT NULL CONSTRAINT DF_Contactos_createdAt DEFAULT (SYSUTCDATETIME()),
        updatedAt   DATETIME2(3)      NOT NULL CONSTRAINT DF_Contactos_updatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Contactos PRIMARY KEY (id)
    );
    PRINT 'Tabla Contactos creada.';
END
GO

-- Tabla Cotizaciones ----------------------------------------------------------
IF OBJECT_ID('dbo.Cotizaciones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cotizaciones (
        id                 INT IDENTITY(1,1) NOT NULL,
        cliente_nombre     NVARCHAR(120)     NOT NULL,
        cliente_email      NVARCHAR(150)     NOT NULL,
        cliente_telefono   NVARCHAR(30)      NULL,
        total              DECIMAL(12, 2)    NOT NULL,
        estado             NVARCHAR(20)      NOT NULL CONSTRAINT DF_Cotizaciones_estado DEFAULT (N'pendiente'),
        createdAt          DATETIME2(3)      NOT NULL CONSTRAINT DF_Cotizaciones_createdAt DEFAULT (SYSUTCDATETIME()),
        updatedAt          DATETIME2(3)      NOT NULL CONSTRAINT DF_Cotizaciones_updatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Cotizaciones PRIMARY KEY (id),
        CONSTRAINT CK_Cotizaciones_estado CHECK (estado IN (N'pendiente', N'atendida', N'cerrada'))
    );
    PRINT 'Tabla Cotizaciones creada.';
END
GO

-- Tabla CotizacionItems -------------------------------------------------------
IF OBJECT_ID('dbo.CotizacionItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CotizacionItems (
        id                INT IDENTITY(1,1) NOT NULL,
        cotizacion_id     INT               NOT NULL,
        producto_id       INT               NULL,
        nombre_producto   NVARCHAR(150)     NOT NULL,
        precio_unitario   DECIMAL(10, 2)    NOT NULL,
        cantidad          INT               NOT NULL,
        subtotal          DECIMAL(12, 2)    NOT NULL,
        createdAt         DATETIME2(3)      NOT NULL CONSTRAINT DF_CotizacionItems_createdAt DEFAULT (SYSUTCDATETIME()),
        updatedAt         DATETIME2(3)      NOT NULL CONSTRAINT DF_CotizacionItems_updatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_CotizacionItems PRIMARY KEY (id),
        CONSTRAINT FK_CotizacionItems_Cotizacion
            FOREIGN KEY (cotizacion_id) REFERENCES dbo.Cotizaciones(id) ON DELETE CASCADE,
        CONSTRAINT FK_CotizacionItems_Producto
            FOREIGN KEY (producto_id) REFERENCES dbo.Productos(id) ON DELETE SET NULL,
        CONSTRAINT CK_CotizacionItems_cantidad CHECK (cantidad >= 1)
    );
    CREATE INDEX IX_CotizacionItems_cotizacion ON dbo.CotizacionItems(cotizacion_id);
    CREATE INDEX IX_CotizacionItems_producto   ON dbo.CotizacionItems(producto_id);
    PRINT 'Tabla CotizacionItems creada.';
END
GO

------------------------------------------------------------------------------
-- 3. Seed: 17 productos extraídos de sitio-original/productos
------------------------------------------------------------------------------
-- Insertar solo los que no existan (idempotente por nombre, gracias a UQ_Productos_nombre).

;WITH seed (nombre, descripcion, precio, categoria, material, imagen_url) AS (
    SELECT * FROM (VALUES
        -- ATAÚDES ------------------------------------------------------------
        (N'MADERA CAOBA TP',
         N'Ataúd elaborado con madera fina que garantiza durabilidad y distinción, con diseño de tapa plana y acabado artesanal.',
         CAST(39588.00 AS DECIMAL(10,2)), N'ataud', N'Madera Caoba',
         N'/img/MADERA CAOBA TP.webp'),

        (N'MADERA CONCAVO',
         N'Ataúd de madera incluido según plan contratado, con servicios de preparación, embalsamado, traslado y asesoría legal.',
         CAST(48288.00 AS DECIMAL(10,2)), N'ataud', N'Madera',
         N'/img/MADERA CONCAVO.webp'),

        (N'MADERA DE LUJO',
         N'Ataúd de madera de lujo incluido según plan contratado, con servicios completos de preparación, traslado en carroza y cremación opcional.',
         CAST(53736.00 AS DECIMAL(10,2)), N'ataud', N'Madera',
         N'/img/MADERA DE LUJO.webp'),

        (N'MADERA FINA TALLADA',
         N'Ataúd de madera fina tallada según plan, con servicios de recolección, estética, embalsamado y traslado.',
         CAST(64200.00 AS DECIMAL(10,2)), N'ataud', N'Madera Tallada',
         N'/img/MADERA FINA TALLADA.webp'),

        (N'METALICO BÁSICO',
         N'Ataúd metálico básico incluido según plan, con servicios de preparación, traslado a templo y asesoría legal.',
         CAST(24678.00 AS DECIMAL(10,2)), N'ataud', N'Metálico',
         N'/img/METALICO BÁSICO.webp'),

        (N'METALICO DE LUJO',
         N'Ataúd metálico de lujo con servicios completos de embalsamado, traslado en carroza y cremación opcional.',
         CAST(48228.00 AS DECIMAL(10,2)), N'ataud', N'Metálico',
         N'/img/METALICO DE LUJO.webp'),

        (N'METALICO ECONÓMICO',
         N'Ataúd metálico económico incluido con servicios de preparación, traslado y asesoría de gestión de trámites.',
         CAST(19428.00 AS DECIMAL(10,2)), N'ataud', N'Metálico',
         N'/img/METALICO ECONÓMICO.webp'),

        (N'METALICO MEDIO',
         N'Ataúd metálico de nivel medio con cobertura de traslado de 65 km y servicios de velación en funeraria.',
         CAST(32784.00 AS DECIMAL(10,2)), N'ataud', N'Metálico',
         N'/img/METALICO MEDIO.webp'),

        -- URNAS --------------------------------------------------------------
        (N'URNA DE JARRÓN',
         N'Urna fabricada en acero inoxidable de alta calidad con acabado pulido. Diseño elegante y resistente para el resguardo de cenizas.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Acero Inoxidable',
         N'/img/URNA DE JARRÓN.webp'),

        (N'URNA DE MADERA BASICA CAFE',
         N'Urna fabricada en madera natural de alta calidad con acabado pulido. Ideal para columbarios y espacios conmemorativos.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Madera',
         N'/img/URNA DE MADERA BASICA CAFE.webp'),

        (N'URNA DE MADERA BÁSICA NEGRO',
         N'Urna fabricada en madera natural con acabado pulido que resalta las vetas. Cada pieza es única por las variaciones naturales del material.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Madera',
         N'/img/URNA DE MADERA BÁSICA NEGRO.webp'),

        (N'URNA DE MADERA DE LUJO',
         N'Urna fabricada en madera natural de alta calidad con diseño elegante y resistente. Ideal para el resguardo de cenizas.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Madera',
         N'/img/URNA DE MADERA DE LUJO .webp'),

        (N'URNA DE MÁRMOL MARFIL',
         N'Urna fabricada en mármol natural de alta calidad con acabado pulido que resalta sus vetas. Material de gran durabilidad.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Mármol',
         N'/img/URNA DE MÁRMOL MARFIL.webp'),

        (N'URNA DE MÁRMOL ROSA',
         N'Urna fabricada en mármol natural de alta calidad con diseño elegante. Cada pieza es única por sus variaciones naturales.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Mármol',
         N'/img/URNA DE MÁRMOL ROSA.webp'),

        (N'URNA DE ÓNIX BLANCO ESFERA',
         N'Urna fabricada en ónix natural de alta calidad con acabado pulido que resalta las vetas. Ideal para el resguardo de cenizas.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Ónix',
         N'/img/URNA DE ÓNIX BLANCO ESFERA.webp'),

        (N'URNA DE ÓNIX ROSA CLÁSICA',
         N'Urna de ónix rosa con diseño clásico, fabricada en piedra natural pulida.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Ónix',
         N'/img/URNA DE ÓNIX ROSA CLÁSICA.webp'),

        (N'URNA INFANTIL DE MADERA',
         N'Urna infantil fabricada en madera natural de alta calidad con acabado pulido. Ideal para espacios conmemorativos infantiles.',
         CAST(1000.00 AS DECIMAL(10,2)), N'urna', N'Madera',
         N'/img/URNA INFANTIL DE MADERA .webp')
    ) AS v(nombre, descripcion, precio, categoria, material, imagen_url)
)
INSERT INTO dbo.Productos (nombre, descripcion, precio, categoria, material, imagen_url, activo)
SELECT s.nombre, s.descripcion, s.precio, s.categoria, s.material, s.imagen_url, 1
FROM   seed s
WHERE  NOT EXISTS (
    SELECT 1 FROM dbo.Productos p WHERE p.nombre = s.nombre
);

PRINT CONCAT('Productos insertados (nuevos): ', @@ROWCOUNT);
GO

-- Resumen
SELECT
    COUNT(*)                                          AS total_productos,
    SUM(CASE WHEN categoria = N'ataud' THEN 1 END)    AS ataudes,
    SUM(CASE WHEN categoria = N'urna'  THEN 1 END)    AS urnas
FROM dbo.Productos;
GO
