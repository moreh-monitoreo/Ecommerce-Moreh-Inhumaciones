import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Inventory extends Model<InferAttributes<Inventory>, InferCreationAttributes<Inventory>> {
  declare id: CreationOptional<number>;
  declare producto_id: number;
  declare branch_id: number;
  declare stock: CreationOptional<number>;
  declare stock_minimo: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Inventory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    stock_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Inventory', tableName: 'Inventories' }
);
