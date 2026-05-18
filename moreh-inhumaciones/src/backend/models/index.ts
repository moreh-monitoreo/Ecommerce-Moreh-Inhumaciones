import { sequelize } from '../config/database';
import { Producto } from './Producto';
import { Contacto } from './Contacto';
import { Cotizacion } from './Cotizacion';
import { CotizacionItem } from './CotizacionItem';

Cotizacion.hasMany(CotizacionItem, {
  as: 'items',
  foreignKey: { name: 'cotizacion_id', allowNull: false },
  onDelete: 'CASCADE',
});
CotizacionItem.belongsTo(Cotizacion, {
  foreignKey: { name: 'cotizacion_id', allowNull: false },
});

CotizacionItem.belongsTo(Producto, {
  as: 'producto',
  foreignKey: { name: 'producto_id', allowNull: true },
});
Producto.hasMany(CotizacionItem, {
  foreignKey: { name: 'producto_id', allowNull: true },
});

export { sequelize, Producto, Contacto, Cotizacion, CotizacionItem };
