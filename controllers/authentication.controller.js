import JwtService from "../services/JwtService.js";
import PasswordService from "../services/PasswordService.js";
import UserService from "../services/UserService.js";

class Authentication {
  constructor() {
    this.createUser = async (req, res) => {
      const { name, email, phoneno, password } = req.body;

      try {
        const emailExists = !!(await UserService.checkUserExist(email));
        if (emailExists) {
          return res.status(409).json({
            stauts: "error",
            message: "Email already exist!",
          });
        }
        const hashedPassword = await PasswordService.encryptPassword(
          password,
          10
        );
        const response = await UserService.createUser(
          name,
          email,
          phoneno,
          hashedPassword
        );
        res.status(201).json({
          status: "success",
          message: "User created Successfully",
          data: response.user,
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

    this.login = async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await UserService.checkUserExist(email);
        if (!!user) {
          const hashedPassword = user.dataValues.password;
          const response = await PasswordService.checkPassword(
            password,
            hashedPassword
          );
          if (response) {
            const token = JwtService.createJwtToken(user.dataValues.id);
            const { id,name } = user.dataValues;
              req.session.userId = id;
              req.session.name = name;
              return res.status(200).json({
                token: token,
                
                status: "Success",
                message: "Password matched successfully",
              });
           
          }
          res.status(401).json({
            status: "fail",
            message: "Password mismatch",
            data: response,
          });
        } else {
          return res.status(404).json({
            message: `Email doesn't exist`,
            status: "fail",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
          message: "Error in checking password try again later",
        });
      }
    };
    this.getUsers = async (req, res) => {
      try {
        const users = await UserService.getAllUsers();

        res.status(201).json({
          message: "Fetched all data",
          users:users.map(({id,name,email})=>({id,name,email})),
        });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
          message: "Error retriving data.",
          data: error,
        });
      }
    };
  }
}
export default new Authentication();
