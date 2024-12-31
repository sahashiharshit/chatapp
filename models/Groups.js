import { DataTypes, Model } from "sequelize";
import { User } from "./User.js";
import { dbconnection } from "../config/database.js";

export class Groups extends Model {}
Groups.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    groupname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  {
    sequelize: dbconnection,
    modelName: "Groups",
    tableName: "groups",
    timestamps: true,
  }
);
