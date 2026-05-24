import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ProductVariant extends Model<InferAttributes<ProductVariant>, InferCreationAttributes<ProductVariant>> {
  declare id: CreationOptional<number>;
  declare producto_id: number;
  declare nombre: string;
  declare precio: number;
  declare stock: CreationOptional<number>;
  declare activo: CreationOptional<boolean>;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProductVariant.init(
  {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre:      { type: DataTypes.STRING(150), allowNull: false },
    precio: {
      type: DataTypes.DECIMAL(12, 2), allowNull: false,
      get() { return parseFloat(this.getDataValue('precio') as unknown as string); },
    },
    stock:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    activo:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    orden:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'ProductVariant', tableName: 'ProductVariants' }
);
