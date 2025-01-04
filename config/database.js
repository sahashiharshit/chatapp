import { Sequelize } from "sequelize";
import { configDotenv } from "dotenv";

configDotenv();
export const dbconnection = new Sequelize({
    dialect:process.env.DB_DIALECT,
    host:'localhost'||process.env.RDS_ENDPOINT,
    username:'harshit'||process.env.DB_USER,
    password:'4202'||process.env.DB_PASSWORD,
    database:'chatdb'||process.env.DB_NAME,
    logging: console.log,
    
});