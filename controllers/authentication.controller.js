import { User } from "../models/User.js";

class Authentication {
  constructor() {
    this.createUser = async (req, res) => {
      const { name, email, phoneno, password } = req.body;
      try {
        const user = await User.create({
           name,
           email,
          phoneno,
           password,
        });
        res.status(201).json(user);
      } catch (error) {
        res.status(500).json(error);
      }
    };
  }
}
export default new Authentication();
