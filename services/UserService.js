
import { User } from "../models/User.js";


class UserService {

    async checkUserExist(email) {
        
        try {
            const result= await User.findOne({
            where:{
                email:email,
            },
            });
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
  async getAllUsers(email){
    try {
        if(email){
            const user = await User.findOne(
            {where:{email:email}}
            );
            if (!user) {
                throw new Error(`User with email ${email} not found`);
            }
            return user;
        }else{
            const users = await User.findAll();
            return users;
        
        }
    
    
    
        } catch (error) {
        console.error("Error:",error);
        throw new Error("Unable to find users. Please try agin")
    }
  }
  

}

export default new UserService();