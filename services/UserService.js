import { User } from "../models/User.js";
import PasswordService from "./PasswordService.js";

class UserService {

    async checkUserExist(email) {
        
        try {
            const result= await User.findOne({
            where:{
                email:email,
            },
            });
            //console.log(result);
            return result;
        } catch (error) {
            console.error("Error checking user existence:", error);
            throw new Error("Unable to check user existence. Please try again later.");
        }
    }
    
    async createUser(name,email,phoneno,hashedPassword){
        try {
            const user = await User.create({
                name,
                email,
                phoneno,
                password:hashedPassword,
            
            });
            
            return user;
        } catch (error) {
            console.error("Error:",error);
            throw new Error("Unable to create new User. Please try again");
        }
    }
  

}

export default new UserService();