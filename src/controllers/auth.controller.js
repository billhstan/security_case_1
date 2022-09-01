//auth.controller.js
const bcrypt = require('bcryptjs');
const authDataService = require('../services/auth.service');
const chalk = require('chalk');
const {DbOption} = require('../config/dbservice.enums');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const Cryptr = require('cryptr');
const util = require('util');

exports.handleLogin = async (req,res) => {
    const cookies = req.signedCookies;
    //--------------------------------------------------------------------------------
    //Programming note:
    //Ideally, when this method is called, you should imagine that the user has used a login interface to logon.
    //By right, the client-side should not have any HTTPOnly cookies. But if there are any found, there is a possibility
    //that, the user never logout but login again. The client-side developer must not allow such possibility to happen.
    //At least, should minimize such occurrences.
    //--------------------------------------------------------------------------------
    console.log(chalk.magenta(`auth.controller.js>>>handleLogin handler>>>[started]`));
    console.log(chalk.magenta(`auth.controller.js>>>handleLogin handler>>>Inspect [cookies] variable`));
    console.log(chalk.magenta(`Cookie available at login: ${util.inspect(cookies)}`));  //The user never logout but login again.
    let { email, password } = req.body;
    console.log(chalk.magenta('auth.controller.js>>>handleLogin handler>>>Inspect [email] and [password] variables'));
    console.log(chalk.magenta('email: '), email);
    console.log(chalk.magenta('password: '),password);
    let userId = '';
    let roleName='';
    const result = await authDataService.findUser({email,actionType:DbOption.FIND_ONE_USER_USING_EMAIL});
    console.log(chalk.magenta('auth.controller.js>>>handleLogin handler>>>Inspect [result]'));
    console.log(chalk.magentaBright(util.inspect(result)));
    console.log(chalk.magenta('bcrypt.compareSync(password, result[0].password) >>>',bcrypt.compareSync(password, result[0].password)));
    if  (result.length==1){
        if(bcrypt.compareSync(password, result[0].password)) {
            //If match ...
            //If the compareSync method returns true, assign a JWT to the client.
            const cryptr = new Cryptr(config.cryptr_secret); //Initialize cryptr to encrypt the  user id
            userId = result[0].user_id;
            roleName=result[0].role_name;
            const encryptedUserData = cryptr.encrypt(userId +':' + roleName);
            console.log(chalk.magenta('Length of encryptedUserData : ' + chalk.bgBlue(encryptedUserData.length)));
            //Create access token
            const newAccessToken = jwt.sign({
                encryptedUserData: encryptedUserData,
                },
                    config.JWTAccessTokenKey, {
                    expiresIn: '30s'
                    //Counted by seconds so 86400 is equivalent to 1 day
                });
               //Create refresh token
               //Fundamentals: refresh token's expiry must be significantly greater
               //than the usual token
               const newRefreshToken= jwt.sign({
                encryptedUserData: encryptedUserData,
                }, config.JWTRefreshTokenKey, {
                expiresIn: '1m',
                }); 
        //If detects a cookie having refresh token information
        //, you will assume that, the user is attempting to log on without
        //having logging out previously. Since a new refresh token is already created,
        //the old one needs to be removed from the refresh_tokens table. 
        const  {refreshToken} = req.signedCookies; //get the cookie by key

        if (refreshToken) {

            /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, then you need to suspect "reuse detection suspected". 
                Need to  clear all RTs  when user logs in.
                How come a user can have more than one refresh tokens? Assuming that the user logon through 
                multiple devices, this backend logic will create  multiple refresh tokens (RT) 
                which belongs to this user in the refresh_tokens table. Need to delete all of them since there is a suspected
                security breach. 
            */
           
            const searchRefreshTokenResult = await authDataService.findRefreshToken({userId,refreshToken,
                actionType:DbOption.FIND_ONE_REFRESH_TOKEN_USING_USERID_AND_REFRESH_TOKEN});
                console.log(chalk.magenta('auth.controller.js>>>handleLogin handler>>>'));
                console.log(chalk.magenta('Inspect [searchRefreshTokenResult] variable'));
                console.log(chalk.green(searchRefreshTokenResult));
            // Detected refresh token reuse! Because, if that received refresh token was used before, the record
            // should have been removed by our backend security logic long time ago.
            if(searchRefreshTokenResult.length==0){
               console.log(chalk.redBright('>>>Attempted refresh token reuse at login!'))
               //Delete all the refresh token records which are linked to the respective user
              await authDataService.deleteRefreshToken({userId,actionType:DbOption.DELETE_ALL_REFRESH_TOKENS});
            }else{
                console.log(chalk.magenta('The [searchRefreshTokenResult.length is not 0]>>>No reuse/stolen possibilities'));
                console.log(chalk.magenta('Proceed to remove the existing found refresh token which belongs to the user now.'));
                console.log(chalk.magenta('Before giving the client-side the new refresh token and save the new RT in database'));
                await authDataService.deleteRefreshToken({refreshToken,actionType:DbOption.DELETE_ONE_REFRESH_TOKEN}) ;
            }
  
            res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
        }//End of checking reuse or stolen scenario

        //Create a new record in the refresh_tokens table 
        await authDataService.addRefreshToken(userId,newRefreshToken);
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    signed: true,
                    secure: true,
                    sameSite: 'none',
                });
                res.cookie('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    signed: true,
                    secure: true,
                    sameSite: 'none',
                });
                 let fullName = result[0].first_name + ',' + 
                 result[0].last_name ;
                 return res.status(200).send({ok:true,message:'Welcome ' + fullName ,fullName:fullName 
                 ,email:result[0].email,isAuthenticated:true});
            } else {
                //If the compareSync method returns false
                ////Other authors also usually use 401 status when user cannot be found in database
                 return res.status(401).send({ok:false,message:'Either email or password is incorrect.',errors:[],data:[]}); 
    }
    }else{
        console.log(chalk.magenta('auth.controller.js>>>handleLogin handler>>>', chalk.red('Cannot find the user details.')));   
        console.log(chalk.magenta('(else block for results.length==1) >>> [started]'));
        return res.status(401).send({ok:false,message:'Either email or password is incorrect.',errors:[],data:[]}); 
    }
}
exports.handleRequest =async (req,res) => {
    //During development I usually use such dummy handler methods to do quick tests on 
    //client-side POST method HTTP request.
    console.log(chalk.magenta('auth.controller.js>>>'));
    console.log(chalk.magenta('handleRequest controller method >>>[started]'));
    console.log(chalk.magenta(`user id extracted from cookie is : ${req.body.userId}`));
    console.log(`other data obtained from the [req.body]: ${JSON.stringify(req.body)}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return res.status(200).send({ok:true,message:`Dummy request url handler for quick test on the authorization middleware `,
    data:[],errors:[]});
}

exports.handleLogout = async (req,res) => {
    console.log(chalk.magenta('auth.controller.js>>>handleLogout handler>>>[started]'));
    const { accessToken,refreshToken } = req.signedCookies;
    console.log(chalk.magenta('auth.controller.js>>>handleLogout handler>>>Don\'t care, just delete all the cookies first.'));
    console.log(`accessToken : ${accessToken}`);
    console.log(`refreshToken: ${refreshToken}`);
    //Clear the two cookies
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'None', secure: true });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
    if(refreshToken) {
        try {
//If refreshToken is found inside the cookies, find and delete the refresh token record in the database.
           const result = await authDataService.deleteRefreshToken({refreshToken,actionType:DbOption.DELETE_ONE_REFRESH_TOKEN}) ;
            console.log(chalk.magenta(`Inspect [result] variable after calling 
            authDataService.deleteRefreshToken>>>`,result.affectedRows));
            return res.status(200).send({ok:true, message:'Completed the operation.',data:[],errors:[]});
           // }
        }catch(error) {
            //All the hinting messages below should be removed. But this project is for learning. Therefore, becareful when reuse it
            //for serious work.
            return res.status(500).send({ok:false, message:'Unable to complete the operation (from auth.controller.js>>handleLogout).',data:[],errors:[]})
        }
    } else {
					//The refresh token cookie might have been removed by the handleRefreshToken handler method.
                    //As a result this else block will be executed by the JavaScript engine.
					return res
						.status(200)
						.send({ok:true,message: `The handleLogout handler method will just blindly kill all the cookies.
                        If this else block is executed, it means that the backend did not detect any refreshToken cookie to
                        delete from the database. The refreshToken cookie is likely deleted by the
                        handleRefreshToken handler method's logic and also, the handler logic refused to recreate a new
                        refresh token and access token because the refresh token has expired due to user long inactivity.` });
				}
}//End of handleLogout

exports.handleRefreshToken = async (req, res) => {
    console.log(chalk.magenta('>>>auth.controller.js>>>handleRefreshToken handler method>>>[Started]'));
    const cookies = req.signedCookies;
    const cryptr = new Cryptr(config.cryptr_secret);
    if (!cookies?.refreshToken) return res.status(401).send({ok:false,
        message:'No refresh token found to process a new access token for you',data:[],errors:[]}); 

    const refreshToken = cookies.refreshToken;
    console.log(chalk.magenta('>>>Inspect the [refreshToken] variable >>> '));
    console.log(chalk.magenta(refreshToken));
    //The refresh token testing is very time consuming. If not lucky or did not do enough test plans,
    //you end up testing for 12 hours with little productive results. The reason is due the following two commands:
    //Each time this block of code is executed, the client-side cookies are destroyed. You need to relog to do a retest.
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
 
   //Should not clear the accessToken HTTPOnly cookie in this handleRefreshToken handler method.
    //res.clearCookie('accessToken', { httpOnly: true, sameSite: 'None', secure: true });
   
    //findUserByRefreshToken should be empty if the refresh token has been used to generate one access token.
    
    //After some thinking, by right I can just check the refresh_tokens table without a table join with users.
    //If the refresh token cannot be found in the database, it means that the refresh token is likely used before.
    //I will still keep the following database query which looks for the refresh token inside the database.
    let resultRows = await authDataService.findUser({ refreshToken,actionType:DbOption.FIND_ONE_USER_USING_REFRESH_TOKEN} );
    //resultRows variable can be either an empty array [] or an array with a single element.
    console.log('handleRefreshToken >>> Inspect the [resultRows] variable >>>>',resultRows);
    const foundUser = (resultRows.length==1)?resultRows[0]:null;
    console.log(chalk.magenta(`handleRefreshToken >>> \nSearching for the user linked to 
    the refresh token: Inspect [foundUser] `));
    console.log(chalk.green(foundUser) );

    //Detected possible refresh token reuse!
    //If the refresh token is not found inside the database, the logic needs to suspect
    //that the refresh token might be reused. To check for such possiblity, need
    //to first make sure that the checks begin if the foundUser is null. (refresh token missing in DB)
    if (foundUser==null) {
        //Then, see if there is an error occuring when the jwt.verify is used on the refresh token.
        try{
        decoded = await jwt.verify(
            refreshToken,
            config.JWTRefreshTokenKey);
                //If there is no error during jwt.verify, the following statements have a chance
                //to execute. Which means, the refresh token is valid and not expired. But the refresh token
                //was not found in the database. The system knows that "only refresh token that
                //that has not been used by the system for checking to generate a new access token are still residing in DB"
                //The current refresh token passed in by the client must have been "stolen and reuse to generate a new access token.
                console.log(chalk.bgBlueBright('Attempted possible refresh token reuse!'));
                //Delete all other refresh token records which are linked to the user id 
                //which is embeded inside the "suspected reuse refresh token".
                console.log('Delete all tokens which belongs to the user id:' ,cryptr.decrypt(decoded.encryptedUserData) ).split(';')[0];
                await authDataService.deleteRefreshToken({userId:cryptr.decrypt(decoded.userId),actionType:DbOption.DELETE_ALL_REFRESH_TOKENS});
                return res.status(401).send({ok:false,message:'Suspected refresh token reuse. You are using a refresh token which is no longer ',data:[],errors:[]});            
        }catch(error){
           
                    //The token can be either rubbish or has expired.
                    //No need to check what kind of error it is.
                    //Quickily respond back to the client
                    //No DB operations are required because refresh token does not exist.
                    //Note that, the client-side's access token and refresh token are already destroyed.
                    //The client side should direct the user to the login view interface.
                    return res.status(401).send({ok:false,message:'',data:[],errors:[]});
                } //End of catch block
    }
   //If the JavaScript engine reaches this part, means that,
   //the refresh token exists in the database.
   //The logic shall continue focus
   //on checking if the refresh token can be decoded.
   //If decoding has failed, very likely it is either token has expired or something else (which I did not further explore)
   //Evaluate JWT token 
   try{
    decoded = await jwt.verify(
        refreshToken,
        config.JWTRefreshTokenKey,
        options= { 'verify_signature': true });
            // After checking all the error possiblities, time to create
            // a new access token and a new refresh token. Note that, I will use decoded variable.
                const newAccessToken = jwt.sign({
                    encryptedUserData: decoded.encryptedUserData 
            },
                config.JWTAccessTokenKey, {
                expiresIn: '30s'
                //Counted by seconds so 86400 is equivalent to 1 day
            });
               //Create refresh token
               const newRefreshToken= jwt.sign({
                encryptedUserData: decoded.encryptedUserData 
                }, config.JWTRefreshTokenKey, {
                expiresIn: '1m',
                }); 
                console.log(chalk.magenta(`handleRefreshToken handler method>>>Create new refresh token 
                record in database>>>[started]`));
           await authDataService.addRefreshToken(foundUser.user_id,newRefreshToken);
           console.log(chalk.magenta(`handleRefreshToken handler method>>>Create new
            refresh token record in database has ended>>>[ended]`));

            // Creates Secure Cookie with refresh token and access token
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                signed: true,
                secure: true,
                sameSite: 'none',
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                signed: true,
                secure: true,
                sameSite: 'none',
            });
            //Delete the refresh token which was used the the client to make a new set of
            //access token and refresh token.
            await authDataService.deleteRefreshToken({refreshToken,actionType:DbOption.DELETE_ONE_REFRESH_TOKEN}) ;
            return res.status(200).send({ok:true,message:`You have successfully used your refrelsh token to ask for a new token.
            Gave you one new token and one new refresh token. 
                Your previous refresh token has been used to create a new shortlived token. Note: The refresh token can be used only once. 
                Therefore, the old one has been deleted from database.`,data:{fullName:foundUser.fullname,email:foundUser.email}})

     }catch(error){
        //TODO: There are other possible JWT error cases which I have not explored.
                //For now, the current code addresses the use case.
                if (error?.message == 'jwt expired'){
                console.log(chalk.magenta('auth.controller.js>>>catch(error) block for jwt.very has occurred.[started]!!!'));    
                console.log(chalk.red('The refresh token has expired. No more refresh token rotation.'));
                //If the refresh token has expired, delete the refresh token in the database.
                console.log(chalk.red('Delete refresh token record>>>[started]'));
                await authDataService.deleteRefreshToken({refreshToken,actionType:DbOption.DELETE_ONE_REFRESH_TOKEN}) ;
                console.log(chalk.red('Delete refresh token record>>>[ended]'));
                //Bascially, the user really has to login again. No more generating new access and refresh tokens.
                            //Any error occured during jwt.verify will have the err variable having some values.
               return res.status(401).send({ok:false,message:`Cannot help you generate a new token
                because your refresh token also rotten. Just login again lah.`});
                }
               //Good and simple reference on definition of logout
               //https://youtu.be/jQn74jB5dg0?t=10
               //Basically, logout means you destroy the JWT access token and also the refresh token (if any inside the database)
               //The backend security logic needs the refresh token from the client-side cookie to delete the refresh token
               //record of the respective user inside the databse.
               //In most video tutorials, access tokens are held inside localStorage or sessionStorage. The client-side
               //JavaScript can remove them to "logically logout the user". For our project, additional steps are needed
               //to find the refresh token of the user inside the refresh_tokens table and delete it.
               //The client-side logic could not delete HTTPOnly type cookie. Therefore the backend logic need to help do it. 
               let tutorialMessage='The last command in the handleRefreshToken URL handler method was executed\n';
               tutorialMessage += 'If this last line of command can execute, it means that the refresh token is not found inside\n';
               tutorialMessage += 'the incoming request. The backend logic is only interested in deleting the refresh token in the db.:\n'
               tutorialMessage += 'The backend logic, at this moment can also help delete all cookies held by the client too.\n';
               tutorialMessage +='Then, the backend logic can finally send a 401 status response. \n';
               tutorialMessage += 'The client-side axios interceptor logic which made the refresh token request will\n';
               tutorialMessage += 'receive this signal, and the client-side logic will take action by doing a reset on the localStorage\n';
               tutorialMessage += 'such as setting store.authenticatedUser, store.absenceLogs etc to empty values etc\n';
               tutorialMessage += 'and finally direct the user to the login view interface.';
               tutorialMessage += 'YouTube reference on definition of logout: [https://youtu.be/jQn74jB5dg0?t=10] \n'
                //Clear the two cookies
               res.clearCookie('accessToken', { httpOnly: true, sameSite: 'None', secure: true });
               res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
               return res.status(401).send({ok:false,message:tutorialMessage});//Note: in real situation, it is just 'forbidden message'
            }
}