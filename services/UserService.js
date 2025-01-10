
import { Op } from "sequelize";
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
  async getUsers(email){
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
  async getUserById(userId){
  try{
    const user = await User.findOne({
    where:{
    id:userId,
    },
    });
    return user;
  }
    catch(error){
    console.error('no user found');
    throw new Error('No User found with this userId');
    }  
  }
  async getUserByQuery(query,userId){
    try {
        const users = await User.findAll({
        
        where:{
        name:{[Op.like]:`%${query}%`},
        id:{[Op.ne]:`${userId}`}
        },
        attributes:['id','name']
        
        });
        return users;
    } catch (error) {
        throw new Error('Failed to fetch participants');
    }
  }

}

export default new UserService();