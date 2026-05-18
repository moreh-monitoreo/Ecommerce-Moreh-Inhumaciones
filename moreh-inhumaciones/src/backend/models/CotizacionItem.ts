import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../config/database';

export class CotizacionItem extends Model<
  InferAttributes<CotizacionItem>,
  InferCreationAttributes<CotizacionItem>
> {
  declare id: CreationOptional<number>;
  declare cotizacion_id: number;
  declare producto_id: number | null;
  declare nombre_producto: string;
  declare precio_unitario: number;
  declare cantidad: number;
  declare subtotal: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CotizacionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cotizacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nombre_producto: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('precio_unitario');
        return raw === null ? null : parseFloat(raw as unknown as string);
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('subtotal');
        return raw === null ? null : parseFloat(raw as unknown as string);
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CotizacionItem',
    tableName: 'CotizacionItems',
  }
);
