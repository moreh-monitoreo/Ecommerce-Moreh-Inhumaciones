import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ProductImage extends Model<InferAttributes<ProductImage>, InferCreationAttributes<ProductImage>> {
  declare id: CreationOptional<number>;
  declare producto_id: number;
  declare url: string;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProductImage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING(255), allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'ProductImage', tableName: 'ProductImages' }
);
