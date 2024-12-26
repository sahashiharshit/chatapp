import fs from "fs";
import jsonwebtoken from "jsonwebtoken";

class JwtService {
  createJwtToken(id) {
    try {
      const payload = { id };
  
     
      const privateKey = fs.readFileSync('./private.pem', "utf-8");
      const token = jsonwebtoken.sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "7200s",
      });
      return token;
    } catch (error) {
      console.error("Error generating JWT:", error);
      throw new Error("Unable to generate token");
    }
  }
}
export default new JwtService();
