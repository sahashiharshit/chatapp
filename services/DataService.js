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

async getAllMessages(){

try{
    const response = await Chats.findAll();
    return response;

}catch(error){
    throw new Error('Failed to find data in database! Please try again later');
}
}

}
export default new DataService();