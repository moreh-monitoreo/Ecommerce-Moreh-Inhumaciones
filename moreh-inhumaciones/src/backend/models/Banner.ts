import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Banner extends Model<InferAttributes<Banner>, InferCreationAttributes<Banner>> {
  declare id: CreationOptional<number>;
  declare titulo: string | null;
  declare subtitulo: string | null;
  declare imagen_url: string;
  declare enlace: string | null;
  declare orden: CreationOptional<number>;
  declare activo: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Banner.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: { type: DataTypes.STRING(200), allowNull: true },
    subtitulo: { type: DataTypes.STRING(300), allowNull: true },
    imagen_url: { type: DataTypes.STRING(255), allowNull: false },
    enlace: { type: DataTypes.STRING(255), allowNull: true },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Banner', tableName: 'Banners' }
);
