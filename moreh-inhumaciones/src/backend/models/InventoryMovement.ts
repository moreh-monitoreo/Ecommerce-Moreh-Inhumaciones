import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'traslado_entrada' | 'traslado_salida';

export class InventoryMovement extends Model<InferAttributes<InventoryMovement>, InferCreationAttributes<InventoryMovement>> {
  declare id: CreationOptional<number>;
  declare producto_id: number;
  declare branch_id: number;
  declare tipo: MovementType;
  declare cantidad: number;
  declare motivo: string | null;
  declare user_id: number | null;
  declare createdAt: CreationOptional<Date>;
}

InventoryMovement.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    branch_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: {
      type: DataTypes.STRING(30), allowNull: false,
      validate: { isIn: [['entrada', 'salida', 'ajuste', 'traslado_entrada', 'traslado_salida']] },
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    motivo: { type: DataTypes.STRING(255), allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'InventoryMovement', tableName: 'InventoryMovements', timestamps: true, updatedAt: false }
);
