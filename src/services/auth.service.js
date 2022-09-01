//*************************************************** */
//auth.service.js
//Data service layer
//*************************************************** */
const mysql = require('../utils/mysql2');
const {DbOption}=require('../config/dbservice.enums');
const chalk = require('chalk');
const util = require('util');
//If you want to find out what is inside DbOptions. Uncomment the following line.
//console.log(chalk.yellow('Inspect what is [DbOption]'));
//console.log(chalk.yellow(DbOption));
module.exports.addRefreshToken =async  (userId,refreshToken) =>  {
    console.log(chalk.green('auth.service.js>>>addRefreshToken data service method>>>[started]'));
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[started]'));
    const connection = await mysql.connection();
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[ended]'));
    try {
        console.log(chalk.green('auth.service.js>>>addRefreshToken data service method>>>[try] block>>>[started]'));
        let query =  `INSERT INTO refresh_tokens (user_id,token) VALUES (?,?)`;
            result = await connection.query(query, [userId,refreshToken ]);
            return result;
    } catch (error) {
        console.log(chalk.red('auth.service.js>>>addRefreshToken>>>error has occurred.'));

        console.log(chalk.red('addRefreshToken data service method>>>[catch] block>>>[started]!!! '));
        console.log(chalk.red('Inspect the [error] variable. '));
        console.log(chalk.redBright(util.inspect(error)));
        console.log(chalk.red('addRefreshToken data service method>>>[catch] block>>>[ended] '));
        //Learning note: The secure coding Error handling coding concepts are not implemented in this project.
        console.log(chalk.red(` >>>throw error now!!! `));
        throw error; 
    } finally {
        console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[started]`));
        await connection.release();
        console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[ended]`));
        console.log(`auth.service.js>>>addRefreshToken data service method>>>[finished]]`);
    }
};
//End of addRefreshToken data service method



module.exports.findUser =async  ({email,refreshToken,actionType}) =>  {
    console.log(chalk.green('auth.service.js>>>findUser data service method>>>[started]'));
    console.log(chalk.green(`auth.service.js>>>findUser data service method>>>has [two action types]`));
    console.log(chalk.yellow('FIND_ONE_USER_USING_REFRESH_TOKEN and FIND_ONE_USER_USING_EMAIL'))  ;
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[started]'));
    const connection = await mysql.connection();
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[ended]'));
    let result;
    switch (actionType){
        case DbOption.FIND_ONE_USER_USING_REFRESH_TOKEN:
    try {
        //This switch case logic needs refreshToken parameter value to search
        console.log(chalk.green('auth.service.js>>>findUser>>>search by fresh token technique>>>[started]'));
        let query =  `SELECT users.user_id, first_name,last_name, email FROM users INNER JOIN 
              refresh_tokens ON users.user_id=refresh_tokens.user_id  
              WHERE token=?`;
            result =  await connection.query(query, [refreshToken ]);
    } catch (error) {
        console.log(chalk.green(`auth.service.js>>>`));
        console.log(chalk.red('findUser>>>search by fresh token technique>>>>>>[catch] block>>>[started]!!!  '));
        console.log(chalk.red('Inspect [error] variable'));
        console.log(util.inspect(error));        
        console.log(chalk.red(`findUser>>>search by fresh token technique>>>>>>[catch] block>>>[ended]!!!`));
        console.log(chalk.red(` >>>throw error now!!! `));
        throw error;; //Note that, the secure coding Error handling coding concepts are not implemented in this project.
    } finally {
        console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[started]`));
        await connection.release();
        console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[ended]`));
        console.log(chalk.green(`auth.service.js>>>findUser data service method>>>[finished]`));
        console.log(chalk.green(`findUser data service method>>>return [result] variable now.`));
        return result; //Returns an array
    }
    case DbOption.FIND_ONE_USER_USING_EMAIL:
        try {
            //This switch case logic needs email parameter value to search
            console.log(chalk.green('auth.service.js>>>findUser'));
            console.log(chalk.green('findUser>>>search by email technique>>>[started]'));
            let query =  `SELECT  users.user_id,first_name,last_name,users.role_id,user_roles.role_name,password,admission_id,email,  
            courses.course_abbreviation FROM  users INNER JOIN user_roles ON users.role_id=user_roles.role_id 
            INNER JOIN courses ON courses.course_id=users.course_id WHERE email =?`;

                result = await connection.query(query, [email ]); //The rows of queried results are stashed inside [result]
              
                //The following three lines of code is just used for testing. Should delete in production.
                if (result.length>0){
                   console.log(chalk.green('Found user with result[0].user_id : ' + chalk.yellow(result[0].user_id) ))
                }
                //The following three lines of code is just used for testing. Should delete in production.
                if (result.length==0){
                    console.log(chalk.green('[result] is empty array when search using : ' + chalk.yellow(email) ))
                 }
         } catch (error) {
            console.log(chalk.red('auth.service.js>>>findUser'));
            console.log(chalk.red('findUser>>>(search by email) technique>>>[catch] block>>>[started]!!!  '));
            console.log(chalk.red(util.inspect(error)));     
            throw error;; //Note that, the secure coding Error handling coding concepts are not implemented in this project.
        } finally {
            console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[started]`));
            await connection.release();
            console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[ended]`));
            console.log(chalk.green('auth.service.js>>>findUser data service method>>>[finished]'));
            return result;
            break;
        }
    }//End of switch
};
//End of findUser data service method

module.exports.findRefreshToken =async  ({userId, refreshToken, actionType}) =>  {
    console.log(chalk.green('auth.service.js>>>findRefreshToken data service method>>>'));
    console.log(chalk.green( `findRefreshToken data service method>>>[One action type]`));
    console.log(chalk.yellow('FIND_ONE_REFRESH_TOKEN_USING_USERID_AND_REFRESH_TOKEN'))
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[started]'));
    const connection = await mysql.connection();
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[ended]'));
    let result;
    switch (actionType){
        case DbOption.FIND_ONE_REFRESH_TOKEN_USING_USERID_AND_REFRESH_TOKEN:
            try {
                console.log(chalk.green('findRefreshToken data service method>>>[started]'));
                console.log(chalk.green('Using the obtained user id and refresh token'));
                console.log(chalk.green('to search the refresh token in the database.'));
                let query =  `SELECT * FROM 
                      refresh_tokens WHERE user_id=? AND 
                      token=?`;
                    result = await connection.query(query, [userId,refreshToken ]);
                    console.log(chalk.green('auth.service.js>>>findRefreshToken>>>'));
                    console.log(chalk.green('Inspect [result] variable'));
                    console.log(util.inspect(result));                         
            } catch (error) {
                console.log(chalk.red('auth.service.js>>>'));
                console.log(chalk.red('findRefreshToken data service method>>>[catch block]>>>[started]!!!  '));
                console.log(chalk.red('>>>Inspect the [error] variable  '));
                console.log(chalk.redBright(util.inspect(error)));          
                console.log(chalk.red('findRefreshToken data service method>>>[catch] block>>>[finished]  '))
                console.log(chalk.red(` >>>throw error now!!! `));;        
                throw error;; //Note that, the secure coding Error handling coding concepts are not implemented in this project.
            } finally {
                console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[started]`));
                await connection.release();
                console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[ended]`));
                console.log(chalk.green('auth.service.js>>>findRefreshToken data service method>>>[finished]'));
                return result;
                break;
            }
    }
};
//End of findRefreshToken data service method

module.exports.deleteRefreshToken =async  ({refreshToken,userId,actionType}) =>  {
    console.log(chalk.green( `auth.service.js>>>deleteRefreshToken data service method>>>[started]`));
    console.log(chalk.green( `deleteRefreshToken data service method>>>[two action types]`));
    console.log(chalk.green('DELETE_ONE_REFRESH_TOKEN and DELETE_ALL_REFRESH_TOKENS'));
    /* I did not provide any validations for "missing" refreshToken or userId inputs */
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[started]'));
    const connection = await mysql.connection();
    console.log(chalk.green('auth.service.js>>>create [connection] object>>>[ended]'));
    let result;
    switch (actionType) {
                    case DbOption.DELETE_ONE_REFRESH_TOKEN:
                        try {
                            console.log(chalk.green(
                                `deleteRefreshToken method>>>(search by using refresh token) 
                                technique (to delete one token only)>>>[try] block>>>[started]`
                            ));
                            let query = `DELETE FROM  refresh_tokens  WHERE token =?`;
                            result = await connection.query(query, [refreshToken]);
                            console.log(chalk.yellow('>>>>Is the token deleted?>>>Inspect the [result.affectedRows].'));
                            console.log(chalk.green(util.inspect(result.affectedRows)));
                            console.log(chalk.green(
                                `deleteRefreshToken method>>>Delete one refresh token (search by using refresh token) 
                                technique  (to delete one token only)>>>[try] block>>>[ended]`
                            ));
                        } catch (error) {
                            console.log(chalk.green(`auth.service.js>>>deleteRefreshToken method`));
                            console.log(chalk.red(`Delete one refresh token (search by token) data service method>>>
                            [catch] block>>>[started]!!!`));
                            console.log(chalk.redBright(util.inspect(error)));
                            throw error;
                        } finally {
                            console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[started]`));
                            await connection.release();
                            console.log(chalk.green(`auth.service.js>>>connection.release() operation>>>[ended]`));
                            console.log(chalk.green('auth.service.js>>>deleteRefreshToken data service method>>>[finished]'));
                            return result;
                            break;
                        }
                    case DbOption.DELETE_ALL_REFRESH_TOKENS:
                        try {
                            console.log(chalk.green(`auth.service.js>>>deleteRefreshToken method`));
                            console.log(chalk.green('deleteRefreshToken>>>Delete all refresh tokens (by user id) technique>>>[started]'));
                            let query =  `DELETE FROM refresh_tokens  WHERE user_id =?`;
                            result = await connection.query(query, [userId]);
                        } catch (err) {
                            console.log(chalk.red('auth.service.js>>>deleteRefreshToken>>>'));
                            console.log(chalk.red('deleteRefreshToken>>>Delete all refresh tokens (by user id) technique>>>[catch] block>>>[started!!!]'));
                            console.log(chalk.red(util.inspect(err)));
                            throw err;
                        } finally {
                            await connection.release();
                            console.log(chalk.green('auth.service.js>>>deleteRefreshToken data service method>>>[finished]'));
                            return result;
                            break;
                        }
                }//End of switch(actionType)
};
//End of deleteRefreshToken data service method

