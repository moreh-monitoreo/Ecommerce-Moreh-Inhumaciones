import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>> {
  declare id: CreationOptional<number>;
  declare order_id: number;
  declare producto_id: number | null;
  declare nombre_producto: string;
  declare cantidad: number;
  declare precio_unitario: number;
  declare subtotal: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: true },
    nombre_producto: { type: DataTypes.STRING(150), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2), allowNull: false,
      get() { return parseFloat(this.getDataValue('precio_unitario') as unknown as string); },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2), allowNull: false,
      get() { return parseFloat(this.getDataValue('subtotal') as unknown as string); },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'OrderItem', tableName: 'OrderItems' }
);
