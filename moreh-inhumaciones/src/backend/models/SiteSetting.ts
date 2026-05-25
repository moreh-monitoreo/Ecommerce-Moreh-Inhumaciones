import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class SiteSetting extends Model<InferAttributes<SiteSetting>, InferCreationAttributes<SiteSetting>> {
  declare clave: string;
  declare valor: string | null;
  declare descripcion: string | null;
  declare updatedAt: CreationOptional<Date>;
}

SiteSetting.init(
  {
    clave: { type: DataTypes.STRING(100), primaryKey: true },
    valor: { type: DataTypes.TEXT, allowNull: true },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'SiteSetting', tableName: 'SiteSettings', timestamps: true, createdAt: false }
);
