import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type LeadStatus = 'nuevo' | 'contactado' | 'calificado' | 'convertido' | 'descartado';

export class Lead extends Model<InferAttributes<Lead>, InferCreationAttributes<Lead>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: string | null;
  declare telefono: string | null;
  declare mensaje: string | null;
  declare fuente: CreationOptional<string>;
  declare status: CreationOptional<LeadStatus>;
  declare asignado_a: number | null;
  declare notas: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Lead.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: true },
    telefono: { type: DataTypes.STRING(50), allowNull: true },
    mensaje: { type: DataTypes.TEXT, allowNull: true },
    fuente: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'contacto_web' },
    status: {
      type: DataTypes.STRING(20), allowNull: false, defaultValue: 'nuevo',
      validate: { isIn: [['nuevo', 'contactado', 'calificado', 'convertido', 'descartado']] },
    },
    asignado_a: { type: DataTypes.INTEGER, allowNull: true },
    notas: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Lead', tableName: 'Leads' }
);
