import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
  declare id: CreationOptional<number>;
  declare modulo: string;
  declare accion: string;
  declare descripcion: string | null;
}

Permission.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    modulo: { type: DataTypes.STRING(80), allowNull: false },
    accion: { type: DataTypes.STRING(40), allowNull: false },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
  },
  { sequelize, modelName: 'Permission', tableName: 'Permissions', timestamps: false }
);
