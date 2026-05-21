/**
 * Seed administrativo: roles, permisos, SuperAdmin y las 14 sucursales reales.
 * Ejecutar DESPUÉS de schema-and-seed.sql (productos).
 * Comando: npx ts-node src/backend/scripts/seed-admin.ts
 */
import { sequelize, Role, Permission, User, Branch, Category } from '../models';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

const MODULOS = ['dashboard', 'productos', 'inventario', 'usuarios', 'roles',
  'sucursales', 'ordenes', 'contratos', 'clientes', 'leads', 'cms', 'reportes', 'auditoria'];
const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

const SUCURSALES = [
  // Sinaloa
  { nombre: 'Culiacán', estado: 'Sinaloa', ciudad: 'Culiacán', telefono: '667 712 5030', horario: '24 horas' },
  { nombre: 'Los Mochis', estado: 'Sinaloa', ciudad: 'Los Mochis', telefono: null, horario: '24 horas' },
  { nombre: 'Mazatlán', estado: 'Sinaloa', ciudad: 'Mazatlán', telefono: null, horario: '24 horas' },
  { nombre: 'La Cruz', estado: 'Sinaloa', ciudad: 'La Cruz', telefono: null, horario: '24 horas' },
  { nombre: 'El Dorado', estado: 'Sinaloa', ciudad: 'El Dorado', telefono: null, horario: '24 horas' },
  { nombre: 'Choix', estado: 'Sinaloa', ciudad: 'Choix', telefono: null, horario: '24 horas' },
  { nombre: 'Badiraguato', estado: 'Sinaloa', ciudad: 'Badiraguato', telefono: null, horario: '24 horas' },
  { nombre: 'El Fuerte', estado: 'Sinaloa', ciudad: 'El Fuerte', telefono: null, horario: '24 horas' },
  // Jalisco
  { nombre: 'Acatic', estado: 'Jalisco', ciudad: 'Acatic', telefono: null, horario: '24 horas' },
  { nombre: 'Chapala', estado: 'Jalisco', ciudad: 'Chapala', telefono: null, horario: '24 horas' },
  { nombre: 'Guadalajara', estado: 'Jalisco', ciudad: 'Guadalajara', telefono: null, horario: '24 horas' },
  { nombre: 'Tepatitlán', estado: 'Jalisco', ciudad: 'Tepatitlán', telefono: null, horario: '24 horas' },
  // Baja California Sur
  { nombre: 'San José del Cabo', estado: 'Baja California Sur', ciudad: 'San José del Cabo', telefono: null, horario: '24 horas' },
  { nombre: 'La Paz', estado: 'Baja California Sur', ciudad: 'La Paz', telefono: null, horario: '24 horas' },
];

const CATEGORIAS = [
  { nombre: 'Ataúdes Metálicos', slug: 'ataud-metalico' },
  { nombre: 'Ataúdes de Madera', slug: 'ataud-madera' },
  { nombre: 'Urnas de Ónix', slug: 'urna-onix' },
  { nombre: 'Urnas de Mármol', slug: 'urna-marmol' },
  { nombre: 'Urnas de Madera', slug: 'urna-madera' },
  { nombre: 'Servicios Funerarios', slug: 'servicios' },
];

async function main() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  logger.info('Seed admin iniciando...');

  // 1. Permisos
  const permRecords: Permission[] = [];
  for (const modulo of MODULOS) {
    for (const accion of ACCIONES) {
      const [p] = await Permission.findOrCreate({
        where: { modulo, accion },
        defaults: { modulo, accion, descripcion: `${accion} en ${modulo}` },
      });
      permRecords.push(p);
    }
  }
  logger.info(`Permisos: ${permRecords.length}`);

  // 2. Roles
  const [superAdminRole] = await Role.findOrCreate({
    where: { nombre: 'SuperAdmin' },
    defaults: { nombre: 'SuperAdmin', descripcion: 'Acceso total al sistema', activo: true },
  });
  await (superAdminRole as Role & { setPermissions: (p: Permission[]) => Promise<void> }).setPermissions(permRecords);

  const viewOnly = permRecords.filter((p) => p.accion === 'ver');

  const roles = [
    { nombre: 'Gerente Sucursal', desc: 'Gestiona su sucursal asignada', perms: permRecords.filter(p => !['roles', 'auditoria'].includes(p.modulo) || p.accion === 'ver') },
    { nombre: 'Director Funerario', desc: 'Gestiona contratos y expedientes', perms: permRecords.filter(p => ['contratos', 'clientes', 'dashboard', 'reportes'].includes(p.modulo)) },
    { nombre: 'Vendedor', desc: 'Crea órdenes y cotizaciones', perms: permRecords.filter(p => ['ordenes', 'productos', 'clientes', 'dashboard'].includes(p.modulo) && p.accion !== 'eliminar') },
    { nombre: 'Cajero', desc: 'Registra pagos y actualiza estados', perms: permRecords.filter(p => ['ordenes', 'contratos', 'dashboard'].includes(p.modulo) && p.accion === 'ver' || p.accion === 'editar') },
    { nombre: 'Recepción', desc: 'Atiende leads y contactos', perms: permRecords.filter(p => ['leads', 'clientes', 'dashboard'].includes(p.modulo)) },
  ];
  for (const r of roles) {
    const [role] = await Role.findOrCreate({
      where: { nombre: r.nombre },
      defaults: { nombre: r.nombre, descripcion: r.desc, activo: true },
    });
    await (role as Role & { setPermissions: (p: Permission[]) => Promise<void> }).setPermissions(r.perms);
  }
  logger.info('Roles creados y permisos asignados.');

  // 3. SuperAdmin user
  const [adminUser, created] = await User.findOrCreate({
    where: { email: 'admin@moreh.mx' },
    defaults: {
      nombre: 'Administrador Moreh',
      email: 'admin@moreh.mx',
      password_hash: await hashPassword('Admin2024!'),
      role_id: superAdminRole.id!,
      branch_id: null,
      activo: true,
      ultimo_acceso: null,
    },
  });
  logger.info(`SuperAdmin: ${adminUser.email} (${created ? 'CREADO' : 'ya existía'})`);

  // 4. Sucursales
  for (const s of SUCURSALES) {
    await Branch.findOrCreate({
      where: { nombre: s.nombre, ciudad: s.ciudad },
      defaults: { ...s, activo: true, direccion: null, lat: null, lng: null, imagen_url: null },
    });
  }
  logger.info('14 sucursales insertadas.');

  // 5. Categorías
  for (const c of CATEGORIAS) {
    await Category.findOrCreate({
      where: { slug: c.slug },
      defaults: { nombre: c.nombre, slug: c.slug, parent_id: null, activo: true },
    });
  }
  logger.info('Categorías insertadas.');

  logger.info('========================================');
  logger.info('Seed completado. Credenciales SuperAdmin:');
  logger.info('  Email:    admin@moreh.mx');
  logger.info('  Password: Admin2024!');
  logger.info('========================================');
  process.exit(0);
}

main().catch((err) => { logger.error(err); process.exit(1); });
