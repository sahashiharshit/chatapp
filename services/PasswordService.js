 import bcrypt from "bcrypt";
 class PasswordService{
    async encryptPassword(password,saltRounds){
    try{
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword= await bcrypt.hash(password,salt);
        return hashedPassword;
    }catch(error){
        console.error("Error hashing password:",error);
    }
    }
    
    async checkPassword(password,hashedPassword){
        try{
            return await bcrypt.compare(password,hashedPassword);
        }catch(error){
            console.error("Error checking password".error);
            throw new Error(`Error in checking password`);
        }
    
    }
 }
 
export default new PasswordService();