//verifyAccessToken.js

const auth = require('../services/auth.service')
const jwt = require('jsonwebtoken');
const config = require('../../config');
const Cryptr = require('cryptr');
const chalk = require('chalk');
exports.verifyToken = (req,res,next) => {
  console.log(chalk.cyan('verifyAccessToken middleware function>>>[Started]'));
    //If you want to see what is inside the req.headers, uncomment the following line.
    //console.log(chalk.cyan(req.headers));
    //https://www.codegrepper.com/code-examples/javascript/express+get+httponly+cookie
    //Technique on reading the HTTPonly cookie is not the same from reading from a usual cookie.
    const  {accessToken} = req.signedCookies; //get the cookie by key
  
    console.log('verifyAccessToken.js>>>verifyToken middleware function>>> Inspect the [accessToken]')
    console.log(chalk.cyan(accessToken));
try {
    const decoded = jwt.verify(accessToken,config.JWTAccessTokenKey);
    console.log('verifyAccessToken.js>>>verifyToken middleware function >>> [decoded] variable content');
    console.log(chalk.cyan(JSON.stringify(decoded)));
    const cryptr = new Cryptr(config.cryptr_secret);
    //The userStringData has <user id value>:<role name value> string data.
    //The userStringData needs to be decrypted before the backend logic can use it to plan values
    //inside the req.body.userId and req.body.roleName
    const decryptedUserData = cryptr.decrypt(decoded.encryptedUserData);
    console.log('Inspect the decryptedUserData : ', chalk.yellow(decryptedUserData));
    //If there is HTTP only cookie accessToken found, the request object will have userId and roleName property.
    //Note that verifyToken method logic DOES NOT verify the refreshToken HTTP only cookie.
    req.body.userId = decryptedUserData.split(':')[0]; 
    req.body.roleName = decryptedUserData.split(':')[1];
    console.log(chalk.cyan('verifyToken middleware function >>>Decrypted user data embeded inside JWT token'));
    console.log('Decrypted user id in req.body.userId : ' ,chalk.cyan(req.body.userId));
    console.log('Decrypted roleName in req.body.roleName : ' ,chalk.cyan(req.body.roleName));

  } catch(error) {
							//Check the error object frequently to familiarize with JWT related errors
							//error.name gives "JsonWebTokenError" if the error is raised by the jwt.verify internal logic.
							//error.message gives "jwt expired" if token has expired.
							//error.message gives "jwt must be provided" if the cookie at the client side has expired.
							//As a result, the server side couldn't get any cookie value to assign 
              //to the accessToken variable which is used as an input for the jwt.verify.
              console.log(chalk.red('verifyAccessToken.js>>>verifyToken>>catch block>>>[Started]! '));
              console.log('>>>verifyToken>>Inspect the [error] object : ',chalk.yellow(error.message));
              //Must always use return in front of res.status... so that other functions have no chance to run.
              return res.status(403).json({ok:false,message:'Forbidden',data:[],errors:[]});
  }
   //If there is error, the "return res.status... " statement inside the catch block 
   //will execute. As a result, the engine will definitely have 
   //no chance to reach the command next() here.
        next()
}//End of verifyToken
