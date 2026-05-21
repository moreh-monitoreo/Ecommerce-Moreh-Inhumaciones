import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Branch extends Model<InferAttributes<Branch>, InferCreationAttributes<Branch>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare estado: string;
  declare ciudad: string;
  declare direccion: string | null;
  declare telefono: string | null;
  declare horario: string | null;
  declare lat: number | null;
  declare lng: number | null;
  declare imagen_url: string | null;
  declare activo: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Branch.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    estado: { type: DataTypes.STRING(80), allowNull: false },
    ciudad: { type: DataTypes.STRING(80), allowNull: false },
    direccion: { type: DataTypes.STRING(255), allowNull: true },
    telefono: { type: DataTypes.STRING(50), allowNull: true },
    horario: { type: DataTypes.STRING(255), allowNull: true },
    lat: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    lng: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    imagen_url: { type: DataTypes.STRING(255), allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Branch', tableName: 'Branches' }
);
