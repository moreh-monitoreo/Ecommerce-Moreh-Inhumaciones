import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../config/database';

export type EstadoCotizacion = 'pendiente' | 'atendida' | 'cerrada';

export class Cotizacion extends Model<
  InferAttributes<Cotizacion>,
  InferCreationAttributes<Cotizacion>
> {
  declare id: CreationOptional<number>;
  declare cliente_nombre: string;
  declare cliente_email: string;
  declare cliente_telefono: string | null;
  declare total: number;
  declare estado: CreationOptional<EstadoCotizacion>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Cotizacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cliente_nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    cliente_email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { isEmail: true },
    },
    cliente_telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('total');
        return raw === null ? null : parseFloat(raw as unknown as string);
      },
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pendiente',
      validate: { isIn: [['pendiente', 'atendida', 'cerrada']] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Cotizacion',
    tableName: 'Cotizaciones',
  }
);
