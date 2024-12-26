
import PasswordService from "../services/PasswordService.js";
import UserService from "../services/UserService.js";


class Authentication {
  constructor() {
    this.createUser = async (req, res) => {
      const { name, email, phoneno, password } = req.body;
    
      try {
        const emailExists = await UserService.checkUserExist(email);
        if(emailExists){
            return res.status(409).json({
            stauts:"error",
            message:"Email already exist!"});
        }
        const hashedPassword = await PasswordService.encryptPassword(password,10); 
        const response = await UserService.createUser(name,email,phoneno,hashedPassword);
        res.status(201).json({
        status:"success",
        message:"User created Successfully",
        data:response.user,
        });
        
      } catch (error) {
        console.error("Error creating user:", error); // Log error for debugging
        res.status(500).json({
          status: "error",
          message: "An internal server error occurred.",
          error: error.message,
      });
    }
    };
  }
}
export default new Authentication();
