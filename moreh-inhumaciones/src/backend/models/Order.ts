import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type OrderStatus = 'pendiente' | 'pagada' | 'en_preparacion' | 'enviada' | 'entregada' | 'cancelada';

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<number>;
  declare customer_id: number | null;
  declare branch_id: number | null;
  declare cliente_nombre: string;
  declare cliente_email: string | null;
  declare cliente_telefono: string | null;
  declare status: CreationOptional<OrderStatus>;
  declare total: number;
  declare metodo_pago: string | null;
  declare direccion_envio: string | null;
  declare notas: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: true },
    cliente_nombre: { type: DataTypes.STRING(150), allowNull: false },
    cliente_email: { type: DataTypes.STRING(150), allowNull: true },
    cliente_telefono: { type: DataTypes.STRING(50), allowNull: true },
    status: {
      type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pendiente',
      validate: { isIn: [['pendiente', 'pagada', 'en_preparacion', 'enviada', 'entregada', 'cancelada']] },
    },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, get() { return parseFloat(this.getDataValue('total') as unknown as string); } },
    metodo_pago: { type: DataTypes.STRING(80), allowNull: true },
    direccion_envio: { type: DataTypes.STRING(300), allowNull: true },
    notas: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Order', tableName: 'Orders' }
);
