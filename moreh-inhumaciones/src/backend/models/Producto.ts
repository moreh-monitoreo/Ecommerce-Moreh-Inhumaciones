import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '../config/database';

export type CategoriaProducto = 'ataud' | 'urna';

export class Producto extends Model<
  InferAttributes<Producto>,
  InferCreationAttributes<Producto>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare descripcion: string | null;
  declare precio: number;
  declare categoria: CategoriaProducto;
  declare material: string | null;
  declare imagen_url: string | null;
  declare activo: CreationOptional<boolean>;
  declare stock: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Producto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('precio');
        return raw === null ? null : parseFloat(raw as unknown as string);
      },
    },
    categoria: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [['ataud', 'urna']] },
    },
    material: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    imagen_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Producto',
    tableName: 'Productos',
  }
);
