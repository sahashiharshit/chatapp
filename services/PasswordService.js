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
 }
 
export default new PasswordService();