import { Sequelize } from "sequelize";


export const sequelize = new Sequelize({
    dialect:'mysql',
    host:'localhost',
    username:'harshit',
    password:'4202',
    database:'chatdb',
   
    
});