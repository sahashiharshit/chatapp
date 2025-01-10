import { DataTypes, Model } from "sequelize";
import { Groups } from "./Groups.js";
import { User } from "./User.js";
import { dbconnection } from "../config/database.js";
export class GroupMembers extends Model {}
GroupMembers.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    isAdmin:{type:DataTypes.BOOLEAN,defaultValue:false},
  },
  {
    sequelize: dbconnection,
    modelName: "GroupMembers",
    tableName: "groupmembers",
    timestamps: true,
  }
);
