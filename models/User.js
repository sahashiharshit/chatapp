import {  DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";


export class User extends Model{

    
    
}
User.init({

    id:{
    type:DataTypes.INTEGER,
    allowNull:false,
    primaryKey:true,
    autoIncrement:true,
    },
    name:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    phoneno:{
        type:DataTypes.STRING,
        allowNull:false,
    
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },

},
{
    sequelize,
    modelName:'User',
    tableName:'users',
},

);