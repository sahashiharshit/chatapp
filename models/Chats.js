import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
export class Chats extends Model{
}

Chats.init({

    id:{
    type:DataTypes.UUID,
    defaultValue:DataTypes.UUIDV4,
    allowNull:false,
    primaryKey:true,
    },
    message:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users', // Name of the table
          key: 'id',      // Column in the referenced table
        },
        onDelete: 'CASCADE', // Deletes posts if the associated user is deleted
        onUpdate: 'CASCADE', // Updates posts if the user's id changes
      },
},{
    sequelize,
    modelName:'Chats',
    tableName:"chats"
});
