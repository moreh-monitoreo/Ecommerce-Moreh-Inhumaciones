-- Crea la base de datos si no existe.
-- Ejecutar como administrador en SQL Server:
--   sqlcmd -S localhost -U sa -P <password> -i create-database.sql
-- O abrir en SSMS y ejecutar.

IF DB_ID('moreh_db') IS NULL
BEGIN
    CREATE DATABASE moreh_db;
    PRINT 'Base de datos moreh_db creada.';
END
ELSE
BEGIN
    PRINT 'La base de datos moreh_db ya existe.';
END
GO
