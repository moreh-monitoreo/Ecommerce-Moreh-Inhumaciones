import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../config/database';

export class Contacto extends Model<
  InferAttributes<Contacto>,
  InferCreationAttributes<Contacto>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: string;
  declare telefono: string | null;
  declare mensaje: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Contacto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { isEmail: true },
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Contacto',
    tableName: 'Contactos',
  }
);
