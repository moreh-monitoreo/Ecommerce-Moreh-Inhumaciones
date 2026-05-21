import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type ContractType = 'velacion_funeraria' | 'velacion_domicilio' | 'inhumacion' | 'exhumacion' | 'cremacion' | 'plan_futuro';
export type ContractStatus = 'cotizado' | 'firmado' | 'en_curso' | 'finalizado' | 'cancelado';

export class ServiceContract extends Model<InferAttributes<ServiceContract>, InferCreationAttributes<ServiceContract>> {
  declare id: CreationOptional<number>;
  declare customer_id: number | null;
  declare branch_id: number | null;
  declare chapel_id: number | null;
  declare tipo: ContractType;
  declare fallecido_nombre: string | null;
  declare fallecido_datos: string | null;
  declare responsable_nombre: string;
  declare responsable_telefono: string | null;
  declare responsable_email: string | null;
  declare fecha_inicio: Date | null;
  declare fecha_fin: Date | null;
  declare status: CreationOptional<ContractStatus>;
  declare total: number;
  declare anticipo: CreationOptional<number>;
  declare saldo: number;
  declare notas: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ServiceContract.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: true },
    chapel_id: { type: DataTypes.INTEGER, allowNull: true },
    tipo: {
      type: DataTypes.STRING(40), allowNull: false,
      validate: { isIn: [['velacion_funeraria', 'velacion_domicilio', 'inhumacion', 'exhumacion', 'cremacion', 'plan_futuro']] },
    },
    fallecido_nombre: { type: DataTypes.STRING(150), allowNull: true },
    fallecido_datos: { type: DataTypes.TEXT, allowNull: true },
    responsable_nombre: { type: DataTypes.STRING(150), allowNull: false },
    responsable_telefono: { type: DataTypes.STRING(50), allowNull: true },
    responsable_email: { type: DataTypes.STRING(150), allowNull: true },
    fecha_inicio: { type: DataTypes.DATE, allowNull: true },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.STRING(20), allowNull: false, defaultValue: 'cotizado',
      validate: { isIn: [['cotizado', 'firmado', 'en_curso', 'finalizado', 'cancelado']] },
    },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, get() { return parseFloat(this.getDataValue('total') as unknown as string); } },
    anticipo: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, get() { return parseFloat(this.getDataValue('anticipo') as unknown as string); } },
    saldo: { type: DataTypes.DECIMAL(12, 2), allowNull: false, get() { return parseFloat(this.getDataValue('saldo') as unknown as string); } },
    notas: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'ServiceContract', tableName: 'ServiceContracts' }
);
