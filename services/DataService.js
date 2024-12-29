import { Op } from "sequelize";
import { Chats } from "../models/Chats.js";

class DataService {

async storeInDb(userId,message){
try{
    const response = await Chats.create({
        message:message,
        userId:userId
        
        });
        return response;

}catch(err){
    throw new Error('Failed to store data in database! Please try again later');
}

}

async getAllMessages(after,before){

try{
    const whereCondition={};
    if(after){
    whereCondition.createdAt={[Op.gt]:new Date(after)};  // Filter messages created after the timestamp
    }
    if(before){
    whereCondition.createdAt={[Op.lt]:new Date(before)};
    }
    const response = await Chats.findAll({
    where:whereCondition,
    order:[['createdAt','ASC']],// Sort messages by creation time
    limit:10,// Optionally, fetch only 10 messages at a time
    });
    return response;

}catch(error){
    throw new Error('Failed to find data in database! Please try again later');
}
}

}
export default new DataService();