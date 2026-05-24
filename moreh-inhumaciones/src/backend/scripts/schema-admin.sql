/* =============================================================================
   Moreh Inhumaciones — Esquema administrativo (extensión)
   SQL Server 2019+
   -----------------------------------------------------------------------------
   Ejecutar DESPUÉS de schema-and-seed.sql (que crea Productos, Contactos, etc.)

   Ejecución:
     sqlcmd -S localhost -U sa -P <password> -d moreh_db -i schema-admin.sql
   -----------------------------------------------------------------------------
   Crea:
     Roles, Permisos, RolePermissions, Users
     Branches, Chapels
     Categories, ProductImages
     Inventory, InventoryMovements
     Customers, Orders, OrderItems
     ServiceContracts
     Leads
     Banners, SiteSettings
     AuditLogs
   ============================================================================= */

-- USE moreh_db;   -- Azure SQL: conectarse a moreh_db directamente en SSMS
-- GO

PRINT '=== Moreh Admin Schema ===';
GO

-- ============================================================================
-- ROLES
-- ============================================================================
IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        nombre      NVARCHAR(100)  NOT NULL UNIQUE,
        descripcion NVARCHAR(500)  NULL,
        activo      BIT            NOT NULL DEFAULT 1,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Roles creada.';
END ELSE PRINT 'Roles ya existe.';
GO

-- ============================================================================
-- PERMISOS
-- ============================================================================
IF OBJECT_ID('dbo.Permissions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Permissions (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        modulo      NVARCHAR(100)  NOT NULL,
        accion      NVARCHAR(100)  NOT NULL,
        descripcion NVARCHAR(300)  NULL,
        CONSTRAINT UQ_Permissions_modulo_accion UNIQUE (modulo, accion)
    );
    PRINT 'Tabla Permissions creada.';
END ELSE PRINT 'Permissions ya existe.';
GO

-- ============================================================================
-- ROLE_PERMISSIONS (M2M)
-- ============================================================================
IF OBJECT_ID('dbo.RolePermissions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RolePermissions (
        role_id       INT NOT NULL REFERENCES dbo.Roles(id) ON DELETE CASCADE,
        permission_id INT NOT NULL REFERENCES dbo.Permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
    );
    PRINT 'Tabla RolePermissions creada.';
END ELSE PRINT 'RolePermissions ya existe.';
GO

-- ============================================================================
-- BRANCHES (Sucursales)
-- ============================================================================
IF OBJECT_ID('dbo.Branches', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Branches (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        nombre      NVARCHAR(150)  NOT NULL,
        estado      NVARCHAR(100)  NOT NULL,
        ciudad      NVARCHAR(100)  NOT NULL,
        direccion   NVARCHAR(500)  NULL,
        telefono    NVARCHAR(50)   NULL,
        horario     NVARCHAR(200)  NULL,
        lat         DECIMAL(10,7)  NULL,
        lng         DECIMAL(10,7)  NULL,
        imagen_url  NVARCHAR(500)  NULL,
        activo      BIT            NOT NULL DEFAULT 1,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Branches creada.';
END ELSE PRINT 'Branches ya existe.';
GO

-- ============================================================================
-- USERS
-- ============================================================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        nombre          NVARCHAR(200)  NOT NULL,
        email           NVARCHAR(200)  NOT NULL UNIQUE,
        password_hash   NVARCHAR(500)  NOT NULL,
        role_id         INT            NOT NULL REFERENCES dbo.Roles(id),
        branch_id       INT            NULL     REFERENCES dbo.Branches(id),
        activo          BIT            NOT NULL DEFAULT 1,
        ultimo_acceso   DATETIME2      NULL,
        createdAt       DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt       DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_Users_email ON dbo.Users(email);
    PRINT 'Tabla Users creada.';
END ELSE PRINT 'Users ya existe.';
GO

-- ============================================================================
-- CHAPELS (Capillas)
-- ============================================================================
IF OBJECT_ID('dbo.Chapels', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Chapels (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        branch_id   INT            NOT NULL REFERENCES dbo.Branches(id) ON DELETE CASCADE,
        nombre      NVARCHAR(150)  NOT NULL,
        capacidad   INT            NULL,
        activo      BIT            NOT NULL DEFAULT 1,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Chapels creada.';
END ELSE PRINT 'Chapels ya existe.';
GO

-- ============================================================================
-- CATEGORIES
-- ============================================================================
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        nombre      NVARCHAR(150)  NOT NULL,
        slug        NVARCHAR(150)  NOT NULL UNIQUE,
        parent_id   INT            NULL REFERENCES dbo.Categories(id),
        activo      BIT            NOT NULL DEFAULT 1,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Categories creada.';
END ELSE PRINT 'Categories ya existe.';
GO

-- ============================================================================
-- PRODUCT_IMAGES
-- ============================================================================
IF OBJECT_ID('dbo.ProductImages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductImages (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        producto_id INT            NOT NULL REFERENCES dbo.Productos(id) ON DELETE CASCADE,
        url         NVARCHAR(500)  NOT NULL,
        orden       INT            NOT NULL DEFAULT 0,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla ProductImages creada.';
END ELSE PRINT 'ProductImages ya existe.';
GO

-- Agregar campos opcionales a Productos si no existen
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Productos' AND COLUMN_NAME='sku')
    ALTER TABLE dbo.Productos ADD sku NVARCHAR(100) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Productos' AND COLUMN_NAME='categoria_id')
    ALTER TABLE dbo.Productos ADD categoria_id INT NULL REFERENCES dbo.Categories(id);
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Productos' AND COLUMN_NAME='precio_mayoreo')
    ALTER TABLE dbo.Productos ADD precio_mayoreo DECIMAL(12,2) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Productos' AND COLUMN_NAME='iva')
    ALTER TABLE dbo.Productos ADD iva DECIMAL(5,4) NULL DEFAULT 0.16;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Productos' AND COLUMN_NAME='slug')
    ALTER TABLE dbo.Productos ADD slug NVARCHAR(200) NULL;
GO
PRINT 'Columnas adicionales en Productos verificadas.';
GO

-- ============================================================================
-- PRODUCT_VARIANTS (Variantes de producto: Velación Domicilio, Funeraria, etc.)
-- ============================================================================
IF OBJECT_ID('dbo.ProductVariants', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductVariants (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        producto_id INT            NOT NULL REFERENCES dbo.Productos(id) ON DELETE CASCADE,
        nombre      NVARCHAR(150)  NOT NULL,
        precio      DECIMAL(12,2)  NOT NULL,
        stock       INT            NOT NULL DEFAULT 0,
        activo      BIT            NOT NULL DEFAULT 1,
        orden       INT            NOT NULL DEFAULT 0,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_ProductVariants_producto ON dbo.ProductVariants(producto_id);
    PRINT 'Tabla ProductVariants creada.';
END ELSE PRINT 'ProductVariants ya existe.';
GO

-- ============================================================================
-- INVENTORY
-- ============================================================================
IF OBJECT_ID('dbo.Inventories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Inventories (
        id            INT IDENTITY(1,1) PRIMARY KEY,
        producto_id   INT  NOT NULL REFERENCES dbo.Productos(id),
        branch_id     INT  NOT NULL REFERENCES dbo.Branches(id),
        stock         INT  NOT NULL DEFAULT 0,
        stock_minimo  INT  NOT NULL DEFAULT 5,
        createdAt     DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt     DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Inventories_prod_branch UNIQUE (producto_id, branch_id)
    );
    PRINT 'Tabla Inventories creada.';
END ELSE PRINT 'Inventories ya existe.';
GO

-- ============================================================================
-- INVENTORY_MOVEMENTS
-- ============================================================================
IF OBJECT_ID('dbo.InventoryMovements', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.InventoryMovements (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        producto_id INT            NOT NULL REFERENCES dbo.Productos(id),
        branch_id   INT            NOT NULL REFERENCES dbo.Branches(id),
        tipo        NVARCHAR(50)   NOT NULL CHECK (tipo IN ('entrada','salida','ajuste','traslado_entrada','traslado_salida')),
        cantidad    INT            NOT NULL,
        motivo      NVARCHAR(300)  NULL,
        user_id     INT            NULL REFERENCES dbo.Users(id),
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_InvMov_branch ON dbo.InventoryMovements(branch_id);
    CREATE INDEX IX_InvMov_producto ON dbo.InventoryMovements(producto_id);
    PRINT 'Tabla InventoryMovements creada.';
END ELSE PRINT 'InventoryMovements ya existe.';
GO

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
IF OBJECT_ID('dbo.Customers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Customers (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        nombre      NVARCHAR(200)  NOT NULL,
        email       NVARCHAR(200)  NULL,
        telefono    NVARCHAR(50)   NULL,
        rfc         NVARCHAR(13)   NULL,
        direccion   NVARCHAR(500)  NULL,
        notas       NVARCHAR(MAX)  NULL,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Customers creada.';
END ELSE PRINT 'Customers ya existe.';
GO

-- ============================================================================
-- ORDERS
-- ============================================================================
IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Orders (
        id                  INT IDENTITY(1,1) PRIMARY KEY,
        customer_id         INT             NULL REFERENCES dbo.Customers(id),
        branch_id           INT             NULL REFERENCES dbo.Branches(id),
        cliente_nombre      NVARCHAR(200)   NOT NULL,
        cliente_email       NVARCHAR(200)   NULL,
        cliente_telefono    NVARCHAR(50)    NULL,
        status              NVARCHAR(30)    NOT NULL DEFAULT 'pendiente'
            CHECK (status IN ('pendiente','pagada','en_preparacion','enviada','entregada','cancelada')),
        total               DECIMAL(12,2)   NOT NULL DEFAULT 0,
        metodo_pago         NVARCHAR(50)    NULL,
        direccion_envio     NVARCHAR(500)   NULL,
        notas               NVARCHAR(MAX)   NULL,
        createdAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
        updatedAt           DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_Orders_status ON dbo.Orders(status);
    PRINT 'Tabla Orders creada.';
END ELSE PRINT 'Orders ya existe.';
GO

-- ============================================================================
-- ORDER_ITEMS
-- ============================================================================
IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderItems (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        order_id        INT             NOT NULL REFERENCES dbo.Orders(id) ON DELETE CASCADE,
        producto_id     INT             NULL REFERENCES dbo.Productos(id),
        nombre_producto NVARCHAR(200)   NOT NULL,
        cantidad        INT             NOT NULL,
        precio_unitario DECIMAL(12,2)   NOT NULL,
        subtotal        DECIMAL(12,2)   NOT NULL,
        createdAt       DATETIME2       NOT NULL DEFAULT GETDATE(),
        updatedAt       DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla OrderItems creada.';
END ELSE PRINT 'OrderItems ya existe.';
GO

-- ============================================================================
-- SERVICE_CONTRACTS (Contratos funerarios)
-- ============================================================================
IF OBJECT_ID('dbo.ServiceContracts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ServiceContracts (
        id                      INT IDENTITY(1,1) PRIMARY KEY,
        customer_id             INT             NULL REFERENCES dbo.Customers(id),
        branch_id               INT             NULL REFERENCES dbo.Branches(id),
        chapel_id               INT             NULL REFERENCES dbo.Chapels(id),
        tipo                    NVARCHAR(50)    NOT NULL
            CHECK (tipo IN ('velacion_funeraria','velacion_domicilio','inhumacion','exhumacion','cremacion','plan_futuro')),
        responsable_nombre      NVARCHAR(200)   NOT NULL,
        responsable_telefono    NVARCHAR(50)    NULL,
        responsable_email       NVARCHAR(200)   NULL,
        fallecido_nombre        NVARCHAR(200)   NULL,
        fecha_inicio            DATETIME2       NULL,
        fecha_fin               DATETIME2       NULL,
        status                  NVARCHAR(30)    NOT NULL DEFAULT 'cotizado'
            CHECK (status IN ('cotizado','firmado','en_curso','finalizado','cancelado')),
        total                   DECIMAL(12,2)   NOT NULL DEFAULT 0,
        anticipo                DECIMAL(12,2)   NOT NULL DEFAULT 0,
        saldo                   DECIMAL(12,2)   NOT NULL DEFAULT 0,
        notas                   NVARCHAR(MAX)   NULL,
        pdf_url                 NVARCHAR(500)   NULL,
        createdAt               DATETIME2       NOT NULL DEFAULT GETDATE(),
        updatedAt               DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_SvcContracts_status ON dbo.ServiceContracts(status);
    CREATE INDEX IX_SvcContracts_tipo   ON dbo.ServiceContracts(tipo);
    PRINT 'Tabla ServiceContracts creada.';
END ELSE PRINT 'ServiceContracts ya existe.';
GO

-- ============================================================================
-- LEADS
-- ============================================================================
IF OBJECT_ID('dbo.Leads', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Leads (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        nombre      NVARCHAR(200)  NOT NULL,
        email       NVARCHAR(200)  NULL,
        telefono    NVARCHAR(50)   NULL,
        mensaje     NVARCHAR(MAX)  NULL,
        fuente      NVARCHAR(50)   NULL DEFAULT 'web'
            CHECK (fuente IN ('web','telefono','whatsapp','referido','presencial')),
        status      NVARCHAR(30)   NOT NULL DEFAULT 'nuevo'
            CHECK (status IN ('nuevo','contactado','calificado','convertido','descartado')),
        assigned_to INT            NULL REFERENCES dbo.Users(id),
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_Leads_status ON dbo.Leads(status);
    PRINT 'Tabla Leads creada.';
END ELSE PRINT 'Leads ya existe.';
GO

-- ============================================================================
-- BANNERS
-- ============================================================================
IF OBJECT_ID('dbo.Banners', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Banners (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        titulo      NVARCHAR(200)  NULL,
        subtitulo   NVARCHAR(400)  NULL,
        imagen_url  NVARCHAR(500)  NOT NULL,
        enlace      NVARCHAR(300)  NULL,
        orden       INT            NOT NULL DEFAULT 0,
        activo      BIT            NOT NULL DEFAULT 1,
        createdAt   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Banners creada.';
END ELSE PRINT 'Banners ya existe.';
GO

-- ============================================================================
-- SITE_SETTINGS
-- ============================================================================
IF OBJECT_ID('dbo.SiteSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SiteSettings (
        clave       NVARCHAR(100)  NOT NULL PRIMARY KEY,
        valor       NVARCHAR(MAX)  NULL,
        descripcion NVARCHAR(300)  NULL,
        updatedAt   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    -- Valores por defecto
    INSERT INTO dbo.SiteSettings (clave, valor, descripcion) VALUES
        ('site_name',       'Moreh Inhumaciones',   'Nombre del sitio web'),
        ('site_phone',      '',                     'Teléfono principal visible en el sitio'),
        ('site_email',      '',                     'Email de contacto público'),
        ('site_address',    '',                     'Dirección corporativa para el footer'),
        ('whatsapp_number', '',                     'Número de WhatsApp sin +'),
        ('facebook_url',    '',                     'URL de Facebook'),
        ('instagram_url',   '',                     'URL de Instagram'),
        ('meta_description','Moreh Inhumaciones — Servicios funerarios en Sinaloa, Jalisco y BCS', 'Descripción SEO del sitio'),
        ('footer_text',     'Moreh Inhumaciones S.A. de C.V. — Todos los derechos reservados', 'Texto del footer');
    PRINT 'Tabla SiteSettings creada con valores por defecto.';
END ELSE PRINT 'SiteSettings ya existe.';
GO

-- ============================================================================
-- AUDIT_LOGS
-- ============================================================================
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        user_id     INT             NULL REFERENCES dbo.Users(id),
        user_email  NVARCHAR(200)   NULL,
        accion      NVARCHAR(50)    NOT NULL CHECK (accion IN ('CREATE','UPDATE','DELETE','LOGIN')),
        entidad     NVARCHAR(100)   NOT NULL,
        entidad_id  NVARCHAR(50)    NULL,
        antes       NVARCHAR(MAX)   NULL,
        despues     NVARCHAR(MAX)   NULL,
        ip          NVARCHAR(50)    NULL,
        user_agent  NVARCHAR(500)   NULL,
        createdAt   DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_AuditLogs_entidad  ON dbo.AuditLogs(entidad);
    CREATE INDEX IX_AuditLogs_accion   ON dbo.AuditLogs(accion);
    CREATE INDEX IX_AuditLogs_created  ON dbo.AuditLogs(createdAt DESC);
    CREATE INDEX IX_AuditLogs_user     ON dbo.AuditLogs(user_id);
    PRINT 'Tabla AuditLogs creada con índices.';
END ELSE PRINT 'AuditLogs ya existe.';
GO

PRINT '';
PRINT '=== Schema admin completado. Ejecutar seed-admin.ts para datos iniciales. ===';
PRINT '    npx ts-node src/backend/scripts/seed-admin.ts';
GO
