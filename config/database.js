import { Sequelize } from "sequelize";
import { configDotenv } from "dotenv";

configDotenv();
export const dbconnection = new Sequelize({
    dialect:process.env.DB_DIALECT,
    host:process.env.RDS_ENDPOINT,
    username:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    logging: console.log,
    
});