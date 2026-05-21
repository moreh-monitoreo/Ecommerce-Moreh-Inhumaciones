/* =============================================================================
   Moreh Inhumaciones — Seed Administrativo
   Ejecutar en SSMS conectado a moreh_db (DESPUÉS de schema-admin.sql)
   -----------------------------------------------------------------------------
   IMPORTANTE: Antes de ejecutar, genera el hash de la contraseña del SuperAdmin
   corriendo esto en PowerShell dentro de la carpeta moreh-inhumaciones:

     node -e "require('./node_modules/bcrypt').hash('Admin2024!',12).then(h=>console.log(h))"

   Copia el hash resultante y reemplaza el valor de @superAdminHash abajo.
   ============================================================================= */

-- ============================================================================
-- 0. Fix: agregar timestamps a RolePermissions si no existen
--    (Sequelize los requiere en tablas junction con belongsToMany)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='RolePermissions' AND COLUMN_NAME='createdAt')
    ALTER TABLE dbo.RolePermissions ADD createdAt DATETIME2 NOT NULL DEFAULT GETDATE();
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='RolePermissions' AND COLUMN_NAME='updatedAt')
    ALTER TABLE dbo.RolePermissions ADD updatedAt DATETIME2 NOT NULL DEFAULT GETDATE();
GO

-- ============================================================================
-- 1. PERMISOS (13 módulos × 4 acciones = 52)
-- ============================================================================
DECLARE @modules TABLE (modulo NVARCHAR(100));
INSERT INTO @modules VALUES
    ('dashboard'),('productos'),('categorias'),('inventario'),
    ('ordenes'),('contratos'),('clientes'),('leads'),
    ('sucursales'),('usuarios'),('roles'),('cms'),
    ('reportes'),('auditoria');

DECLARE @actions TABLE (accion NVARCHAR(100));
INSERT INTO @actions VALUES ('ver'),('crear'),('editar'),('eliminar');

INSERT INTO dbo.Permissions (modulo, accion, descripcion)
SELECT m.modulo, a.accion, m.modulo + ':' + a.accion
FROM @modules m
CROSS JOIN @actions a
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Permissions p
    WHERE p.modulo = m.modulo AND p.accion = a.accion
);
PRINT CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos insertados.';
GO

-- ============================================================================
-- 2. ROLES
-- ============================================================================
MERGE dbo.Roles AS target
USING (VALUES
    ('SuperAdmin',        'Acceso total al sistema sin restricciones'),
    ('Gerente Sucursal',  'Gestión completa de su sucursal asignada'),
    ('Director Funerario','Gestión de contratos y servicios funerarios'),
    ('Vendedor',          'Ventas, órdenes y atención a clientes'),
    ('Cajero',            'Registro de pagos y órdenes'),
    ('Recepción',         'Atención inicial y registro de leads')
) AS source (nombre, descripcion)
ON target.nombre = source.nombre
WHEN NOT MATCHED THEN
    INSERT (nombre, descripcion, activo, createdAt, updatedAt)
    VALUES (source.nombre, source.descripcion, 1, GETDATE(), GETDATE());
PRINT CAST(@@ROWCOUNT AS NVARCHAR) + ' roles insertados.';
GO

-- ============================================================================
-- 3. ROLE_PERMISSIONS
-- ============================================================================

-- SuperAdmin: TODOS los permisos
INSERT INTO dbo.RolePermissions (role_id, permission_id, createdAt, updatedAt)
SELECT r.id, p.id, GETDATE(), GETDATE()
FROM dbo.Roles r
CROSS JOIN dbo.Permissions p
WHERE r.nombre = 'SuperAdmin'
AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
PRINT 'SuperAdmin: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos asignados.';

-- Gerente Sucursal: todo excepto roles y auditoría
INSERT INTO dbo.RolePermissions (role_id, permission_id, createdAt, updatedAt)
SELECT r.id, p.id, GETDATE(), GETDATE()
FROM dbo.Roles r
JOIN dbo.Permissions p ON p.modulo NOT IN ('roles', 'auditoria')
WHERE r.nombre = 'Gerente Sucursal'
AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
PRINT 'Gerente Sucursal: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos asignados.';

-- Director Funerario: contratos, clientes, leads, reportes, dashboard (ver)
INSERT INTO dbo.RolePermissions (role_id, permission_id, createdAt, updatedAt)
SELECT r.id, p.id, GETDATE(), GETDATE()
FROM dbo.Roles r
JOIN dbo.Permissions p ON (
    p.modulo IN ('contratos', 'clientes', 'leads', 'reportes')
    OR (p.modulo = 'dashboard' AND p.accion = 'ver')
    OR (p.modulo = 'sucursales' AND p.accion = 'ver')
)
WHERE r.nombre = 'Director Funerario'
AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
PRINT 'Director Funerario: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos asignados.';

-- Vendedor: productos (ver), ordenes (ver/crear), clientes (ver/crear), leads (ver/crear/editar), dashboard (ver)
INSERT INTO dbo.RolePermissions (role_id, permission_id, createdAt, updatedAt)
SELECT r.id, p.id, GETDATE(), GETDATE()
FROM dbo.Roles r
JOIN dbo.Permissions p ON (
    (p.modulo = 'dashboard'  AND p.accion = 'ver')
    OR (p.modulo = 'productos' AND p.accion = 'ver')
    OR (p.modulo = 'ordenes'   AND p.accion IN ('ver','crear'))
    OR (p.modulo = 'clientes'  AND p.accion IN ('ver','crear','editar'))
    OR (p.modulo = 'leads'     AND p.accion IN ('ver','crear','editar'))
    OR (p.modulo = 'contratos' AND p.accion IN ('ver','crear'))
)
WHERE r.nombre = 'Vendedor'
AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
PRINT 'Vendedor: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos asignados.';

-- Cajero: ordenes (ver/crear/editar), contratos (ver), dashboard (ver)
INSERT INTO dbo.RolePermissions (role_id, permission_id, createdAt, updatedAt)
SELECT r.id, p.id, GETDATE(), GETDATE()
FROM dbo.Roles r
JOIN dbo.Permissions p ON (
    (p.modulo = 'dashboard' AND p.accion = 'ver')
    OR (p.modulo = 'ordenes'   AND p.accion IN ('ver','crear','editar'))
    OR (p.modulo = 'contratos' AND p.accion = 'ver')
    OR (p.modulo = 'clientes'  AND p.accion = 'ver')
)
WHERE r.nombre = 'Cajero'
AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
PRINT 'Cajero: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos asignados.';

-- Recepción: leads (ver/crear), clientes (ver), contratos (ver), dashboard (ver)
INSERT INTO dbo.RolePermissions (role_id, permission_id, createdAt, updatedAt)
SELECT r.id, p.id, GETDATE(), GETDATE()
FROM dbo.Roles r
JOIN dbo.Permissions p ON (
    (p.modulo = 'dashboard' AND p.accion = 'ver')
    OR (p.modulo = 'leads'    AND p.accion IN ('ver','crear'))
    OR (p.modulo = 'clientes' AND p.accion = 'ver')
    OR (p.modulo = 'contratos'AND p.accion = 'ver')
)
WHERE r.nombre = 'Recepción'
AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
PRINT 'Recepción: ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' permisos asignados.';
GO

-- ============================================================================
-- 4. USUARIO SUPERADMIN
-- ----------------------------------------------------------------------------
-- Hash bcrypt de "Admin2024!" con 12 rondas.
-- Si necesitas regenerarlo corre en PowerShell (dentro de moreh-inhumaciones):
--   node -e "require('./node_modules/bcrypt').hash('Admin2024!',12).then(h=>console.log(h))"
-- y reemplaza el valor de @hash abajo.
-- ============================================================================
DECLARE @hash NVARCHAR(500);
SET @hash = N'$2b$12$R03AOibJe.5Txu5vg3JLPO/LKtDmzlwyjvtW4OxycF3wPmF3iNNT2';

-- ⚠ Si ya ejecutaste el seed-admin.ts parcialmente y el usuario existe, esta
--   sección no insertará duplicados (usa la condición NOT EXISTS).
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'admin@moreh.mx')
BEGIN
    DECLARE @superAdminRoleId INT;
    SELECT @superAdminRoleId = id FROM dbo.Roles WHERE nombre = 'SuperAdmin';

    INSERT INTO dbo.Users (nombre, email, password_hash, role_id, branch_id, activo, createdAt, updatedAt)
    VALUES (N'Administrador', N'admin@moreh.mx', @hash, @superAdminRoleId, NULL, 1, GETDATE(), GETDATE());
    PRINT 'Usuario SuperAdmin creado: admin@moreh.mx';
END
ELSE
    PRINT 'Usuario admin@moreh.mx ya existe — omitido.';
GO

-- ============================================================================
-- 5. SUCURSALES (14: 8 Sinaloa, 4 Jalisco, 2 BCS)
-- ============================================================================
MERGE dbo.Branches AS target
USING (VALUES
    -- Sinaloa
    (N'Culiacán Centro',    N'Sinaloa', N'Culiacán',    N'Blvd. Francisco I. Madero 2890',  N'667-100-0001', N'24 horas', 24.8091300, -107.3938000),
    (N'Culiacán Norte',     N'Sinaloa', N'Culiacán',    N'Blvd. Lázaro Cárdenas 1540',      N'667-100-0002', N'24 horas', 24.8371000, -107.4015000),
    (N'Mazatlán Centro',    N'Sinaloa', N'Mazatlán',    N'Av. Insurgentes 320',              N'669-100-0001', N'24 horas', 23.2494000, -106.4111000),
    (N'Mazatlán Norte',     N'Sinaloa', N'Mazatlán',    N'Blvd. Sábalo Cerritos 2540',      N'669-100-0002', N'24 horas', 23.2860000, -106.3978000),
    (N'Los Mochis',         N'Sinaloa', N'Los Mochis',  N'Av. Álvaro Obregón 870',          N'668-100-0001', N'24 horas', 25.7972000, -108.9961000),
    (N'Guasave',            N'Sinaloa', N'Guasave',     N'Calle Ángel Flores 230',           N'687-100-0001', N'24 horas', 25.5690000, -108.4700000),
    (N'Guamúchil',          N'Sinaloa', N'Guamúchil',   N'Av. Constitución 140',             N'673-100-0001', N'24 horas', 25.4580000, -108.0800000),
    (N'Navolato',           N'Sinaloa', N'Navolato',    N'Calle Benito Juárez 55',           N'672-100-0001', N'24 horas', 24.7646000, -107.7020000),
    -- Jalisco
    (N'Guadalajara',        N'Jalisco', N'Guadalajara',  N'Av. Federalismo Norte 1250',      N'33-100-0001',  N'24 horas', 20.6970000, -103.3497000),
    (N'Acatic',             N'Jalisco', N'Acatic',       N'Calle Hidalgo 78',                N'378-100-0001', N'24 horas', 20.7892000, -102.9100000),
    (N'Tepatitlán',         N'Jalisco', N'Tepatitlán',   N'Blvd. José María Martínez 420',  N'378-100-0002', N'24 horas', 20.8148000, -102.7462000),
    (N'Zapopan',            N'Jalisco', N'Zapopan',      N'Av. Laureles 980',                N'33-100-0002',  N'24 horas', 20.7214000, -103.3910000),
    -- Baja California Sur
    (N'La Paz',             N'Baja California Sur', N'La Paz',            N'Blvd. Forjadores de BCS 980', N'612-100-0001', N'24 horas', 24.1426000, -110.3128000),
    (N'Los Cabos',          N'Baja California Sur', N'San José del Cabo', N'Blvd. Mijares 1600',           N'624-100-0001', N'24 horas', 23.0581000, -109.6930000)
) AS source (nombre, estado, ciudad, direccion, telefono, horario, lat, lng)
ON target.nombre = source.nombre
WHEN NOT MATCHED THEN
    INSERT (nombre, estado, ciudad, direccion, telefono, horario, lat, lng, activo, createdAt, updatedAt)
    VALUES (source.nombre, source.estado, source.ciudad, source.direccion,
            source.telefono, source.horario, source.lat, source.lng, 1, GETDATE(), GETDATE());
PRINT CAST(@@ROWCOUNT AS NVARCHAR) + ' sucursales insertadas.';
GO

-- ============================================================================
-- 6. CATEGORÍAS
-- ============================================================================
-- Raíces primero
MERGE dbo.Categories AS target
USING (VALUES
    (N'Ataúdes',  N'ataud',  NULL),
    (N'Urnas',    N'urna',   NULL)
) AS source (nombre, slug, parent_id)
ON target.slug = source.slug
WHEN NOT MATCHED THEN
    INSERT (nombre, slug, parent_id, activo, createdAt, updatedAt)
    VALUES (source.nombre, source.slug, source.parent_id, 1, GETDATE(), GETDATE());
GO

-- Subcategorías
MERGE dbo.Categories AS target
USING (VALUES
    (N'Ataúd de Madera',   N'ataud-madera',    N'ataud'),
    (N'Ataúd Metálico',    N'ataud-metalico',  N'ataud'),
    (N'Urna de Mármol',    N'urna-marmol',     N'urna'),
    (N'Urna de Madera',    N'urna-madera',     N'urna'),
    (N'Urna de Ónix',      N'urna-onix',       N'urna'),
    (N'Urna Infantil',     N'urna-infantil',   N'urna')
) AS source (nombre, slug, parent_slug)
ON target.slug = source.slug
WHEN NOT MATCHED THEN
    INSERT (nombre, slug, parent_id, activo, createdAt, updatedAt)
    SELECT source.nombre, source.slug, p.id, 1, GETDATE(), GETDATE()
    FROM dbo.Categories p
    WHERE p.slug = source.parent_slug;
PRINT CAST(@@ROWCOUNT AS NVARCHAR) + ' subcategorías insertadas.';
GO

-- ============================================================================
-- Resumen final
-- ============================================================================
SELECT 'Permisos'   AS Tabla, COUNT(*) AS Total FROM dbo.Permissions
UNION ALL SELECT 'Roles',             COUNT(*) FROM dbo.Roles
UNION ALL SELECT 'RolePermissions',   COUNT(*) FROM dbo.RolePermissions
UNION ALL SELECT 'Users',             COUNT(*) FROM dbo.Users
UNION ALL SELECT 'Branches',          COUNT(*) FROM dbo.Branches
UNION ALL SELECT 'Categories',        COUNT(*) FROM dbo.Categories;
GO

PRINT '';
PRINT '=== Seed completado. ===';
PRINT 'Login: admin@moreh.mx';
PRINT 'Para el password, actualiza la columna password_hash en Users con el hash bcrypt.';
GO
