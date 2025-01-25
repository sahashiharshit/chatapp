import { Sequelize } from "sequelize";
//import { configDotenv } from "dotenv";

//configDotenv();
export const dbconnection = new Sequelize({
    dialect:process.env.DB_DIALECT||'mysql',
    host:process.env.RDS_ENDPOINT||'localhost',
    username:process.env.DB_USER||'harshit',
    password:process.env.DB_PASSWORD||'4202',
    database:process.env.DB_NAME||'chatdb',
    logging: console.log,
    
});