import { DataTypes, Model } from "sequelize";
import { dbconnection } from "../config/database.js";

export class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneno: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: dbconnection,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);
