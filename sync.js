import { dbconnection } from "./config/database.js"
import {User,GroupMembers,Groups,Chats} from './config/association.js';
(async()=>{

try{
    await dbconnection.sync({alter:true});
    console.log('Database Synchronized');
}catch(error){
    console.error('Unable to synchronize database:',error);
}

})();