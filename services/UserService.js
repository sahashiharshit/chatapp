import { User } from "../models/User.js";

class UserService {

     checkUserExist(email) {
        
        try {
            const result= User.findAll({
            where:{
                email:email,
            }
            });
            console.log(result);
            if(result){
            return true;
            }
            return false;
        } catch (error) {
            return error;
        }
    }

}

export default new UserService();