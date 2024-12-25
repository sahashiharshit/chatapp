import { User } from "../models/User.js";
import PasswordService from "../services/PasswordService.js";
import UserService from "../services/UserService.js";


class Authentication {
  constructor() {
    this.createUser = async (req, res) => {
      const { name, email, phoneno, password } = req.body;
     
      try {
        const checkEmail = UserService.checkUserExist(email);
        if(!checkEmail){
            return res.json({message:"Email already exist!"});
        }
        const newHashedPassword = PasswordService.encryptPassword(password,10);
        const user = await User.create({
          name,
          email,
          phoneno,
          password:newHashedPassword,
        });
        res.status(201).json(user);
      } catch (error) {
        res.status(500).json(error);
      }
    };
  }
}
export default new Authentication();
