import { sequelize } from "./config/database.js"
import { User } from "./models/User.js";
(async()=>{

try{
    await sequelize.sync({alter:true});
    console.log('Database Synchronized');
}catch(error){
    console.error('Unable to synchronize database:',error);
}

})();