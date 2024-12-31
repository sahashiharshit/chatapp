import { DataTypes, Model } from "sequelize";
import { dbconnection } from "../config/database.js";
import { Groups } from "./Groups.js";
import { User } from "./User.js";
export class Chats extends Model {}

Chats.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Groups, key: "id" },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User, // Name of the table
        key: "id", // Column in the referenced table
      },
    },
  },
  {
    sequelize: dbconnection,
    modelName: "Chats",
    tableName: "chats",
    timestamps: true,
  }
);
