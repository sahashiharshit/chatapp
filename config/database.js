import { Sequelize } from "sequelize";


export const dbconnection = new Sequelize({
    dialect:'mysql',
    host:'localhost',
    username:'harshit',
    password:'4202',
    database:'chatdb',
    logging: console.log,
    
});