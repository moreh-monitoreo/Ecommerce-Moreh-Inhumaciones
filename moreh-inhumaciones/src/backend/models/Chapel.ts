import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Chapel extends Model<InferAttributes<Chapel>, InferCreationAttributes<Chapel>> {
  declare id: CreationOptional<number>;
  declare branch_id: number;
  declare nombre: string;
  declare capacidad: number | null;
  declare activo: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Chapel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    capacidad: { type: DataTypes.INTEGER, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Chapel', tableName: 'Chapels' }
);
