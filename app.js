import express from 'express';
import { sequelize } from './config/database.js';
import routes from './router/index.js';


const app =express();
const port = 3000;

app.use(express.json());
app.use('/chatapp',routes);

(async()=>{
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        app.listen(port,()=>{
        console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();