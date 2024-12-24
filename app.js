import express from 'express';
import  cors  from "cors";

import {auth} from './routes/authRoutes';
const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth',auth);



app.listen(3000);
