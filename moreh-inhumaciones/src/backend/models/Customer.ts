import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: string | null;
  declare telefono: string | null;
  declare rfc: string | null;
  declare direccion: string | null;
  declare notas: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Customer.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: true },
    telefono: { type: DataTypes.STRING(50), allowNull: true },
    rfc: { type: DataTypes.STRING(20), allowNull: true },
    direccion: { type: DataTypes.STRING(300), allowNull: true },
    notas: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Customer', tableName: 'Customers' }
);
