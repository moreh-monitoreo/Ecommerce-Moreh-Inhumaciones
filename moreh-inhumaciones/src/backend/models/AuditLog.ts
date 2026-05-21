import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class AuditLog extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>> {
  declare id: CreationOptional<number>;
  declare user_id: number | null;
  declare user_email: string | null;
  declare accion: string;
  declare entidad: string;
  declare entidad_id: string | null;
  declare antes: string | null;
  declare despues: string | null;
  declare ip: string | null;
  declare user_agent: string | null;
  declare createdAt: CreationOptional<Date>;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    user_email: { type: DataTypes.STRING(150), allowNull: true },
    accion: { type: DataTypes.STRING(60), allowNull: false },
    entidad: { type: DataTypes.STRING(80), allowNull: false },
    entidad_id: { type: DataTypes.STRING(40), allowNull: true },
    antes: { type: DataTypes.TEXT, allowNull: true },
    despues: { type: DataTypes.TEXT, allowNull: true },
    ip: { type: DataTypes.STRING(60), allowNull: true },
    user_agent: { type: DataTypes.STRING(300), allowNull: true },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'AuditLog', tableName: 'AuditLogs', timestamps: true, updatedAt: false }
);
