import { sequelize } from '../config/database';
import { Producto } from './Producto';
import { Contacto } from './Contacto';
import { Cotizacion } from './Cotizacion';
import { CotizacionItem } from './CotizacionItem';
import { Role } from './Role';
import { Permission } from './Permission';
import { User } from './User';
import { AuditLog } from './AuditLog';
import { Branch } from './Branch';
import { Chapel } from './Chapel';
import { Category } from './Category';
import { ProductImage } from './ProductImage';
import { Inventory } from './Inventory';
import { InventoryMovement } from './InventoryMovement';
import { Customer } from './Customer';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { ServiceContract } from './ServiceContract';
import { Lead } from './Lead';
import { Banner } from './Banner';
import { SiteSetting } from './SiteSetting';
import { ProductVariant } from './ProductVariant';

// ── Cotizaciones ──────────────────────────────────────────────────────────────
Cotizacion.hasMany(CotizacionItem, {
  as: 'items',
  foreignKey: { name: 'cotizacion_id', allowNull: false },
  onDelete: 'CASCADE',
});
CotizacionItem.belongsTo(Cotizacion, { foreignKey: { name: 'cotizacion_id', allowNull: false } });
CotizacionItem.belongsTo(Producto, { as: 'producto', foreignKey: { name: 'producto_id', allowNull: true } });
Producto.hasMany(CotizacionItem, { foreignKey: { name: 'producto_id', allowNull: true } });

// ── Roles y Usuarios ──────────────────────────────────────────────────────────
Role.belongsToMany(Permission, { through: 'RolePermissions', foreignKey: 'role_id', otherKey: 'permission_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: 'RolePermissions', foreignKey: 'permission_id', otherKey: 'role_id', as: 'roles' });

User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Branch, { as: 'branch', foreignKey: 'branch_id' });
Branch.hasMany(User, { foreignKey: 'branch_id' });

// ── Sucursales y Capillas ──────────────────────────────────────────────────────
Branch.hasMany(Chapel, { as: 'chapels', foreignKey: 'branch_id', onDelete: 'CASCADE' });
Chapel.belongsTo(Branch, { as: 'branch', foreignKey: 'branch_id' });

// ── Productos e Imágenes ───────────────────────────────────────────────────────
Producto.belongsTo(Category, { as: 'categoriaDetalle', foreignKey: 'categoria_id' });
Category.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.hasMany(ProductImage, { as: 'imagenes', foreignKey: 'producto_id', onDelete: 'CASCADE' });
ProductImage.belongsTo(Producto, { foreignKey: 'producto_id' });

// ── Variantes de Producto ──────────────────────────────────────────────────────
Producto.hasMany(ProductVariant, { as: 'variantes', foreignKey: 'producto_id', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });

// ── Inventario ─────────────────────────────────────────────────────────────────
Producto.hasMany(Inventory, { as: 'inventarios', foreignKey: 'producto_id' });
Inventory.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });
Branch.hasMany(Inventory, { foreignKey: 'branch_id' });
Inventory.belongsTo(Branch, { as: 'sucursal', foreignKey: 'branch_id' });

Producto.hasMany(InventoryMovement, { foreignKey: 'producto_id' });
InventoryMovement.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });
Branch.hasMany(InventoryMovement, { foreignKey: 'branch_id' });
InventoryMovement.belongsTo(Branch, { as: 'sucursal', foreignKey: 'branch_id' });
User.hasMany(InventoryMovement, { foreignKey: 'user_id' });
InventoryMovement.belongsTo(User, { as: 'usuario', foreignKey: 'user_id' });

// ── Órdenes ───────────────────────────────────────────────────────────────────
Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { as: 'cliente', foreignKey: 'customer_id' });
Branch.hasMany(Order, { foreignKey: 'branch_id' });
Order.belongsTo(Branch, { as: 'sucursal', foreignKey: 'branch_id' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Producto.hasMany(OrderItem, { foreignKey: 'producto_id' });
OrderItem.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });

// ── Contratos ─────────────────────────────────────────────────────────────────
Customer.hasMany(ServiceContract, { foreignKey: 'customer_id' });
ServiceContract.belongsTo(Customer, { as: 'cliente', foreignKey: 'customer_id' });
Branch.hasMany(ServiceContract, { foreignKey: 'branch_id' });
ServiceContract.belongsTo(Branch, { as: 'sucursal', foreignKey: 'branch_id' });
Chapel.hasMany(ServiceContract, { foreignKey: 'chapel_id' });
ServiceContract.belongsTo(Chapel, { as: 'capilla', foreignKey: 'chapel_id' });

// ── Leads ─────────────────────────────────────────────────────────────────────
User.hasMany(Lead, { foreignKey: 'asignado_a' });
Lead.belongsTo(User, { as: 'asignado', foreignKey: 'asignado_a' });

export {
  sequelize,
  Producto, Contacto, Cotizacion, CotizacionItem,
  Role, Permission, User, AuditLog,
  Branch, Chapel, Category, ProductImage,
  Inventory, InventoryMovement,
  Customer, Order, OrderItem, ServiceContract,
  Lead, Banner, SiteSetting, ProductVariant,
};
