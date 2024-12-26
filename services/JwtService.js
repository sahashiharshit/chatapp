import fs from 'fs'
import jsonwebtoken from 'jsonwebtoken';
class JwtService {


    createJwtToken(user){
    
    const privateKey = fs.readFileSync("./private.pem","utf-8");
    const token = jsonwebtoken.sign(user.id,privateKey,{algorithm:'RS256',expiresIn:'7200s'});
    return token;
    }




}
export default new JwtService();