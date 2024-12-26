import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database.js';
import routes from './router/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app =express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use(cors({
    origin:(origin,callback)=>{
        if(!origin||origin.startsWith('http://127.0.0.1')){
        callback(null,true);
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods:['GET','POST'],
}));
app.use(express.static(path.join(__dirname,'public')));
//console.log('Views directory:', path.join(__dirname, 'views'));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','index.html'));

});
app.get('/signup.html',(req,res)=>{

    res.sendFile(path.join(__dirname,'views','signup.html'));
    
});
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  });
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