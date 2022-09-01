//monitorrefreshtoken.controller.js
const mysql = require('../utils/mysql2');
const {DbOption}=require('../config/dbservice.enums');
const chalk = require('chalk');

module.exports.findRefreshToken =async  ({userId, actionType}) =>  {
    const connection = await mysql.connection();
    let result;
    switch (actionType){
        case DbOption.FIND_ALL_TIED_TO_ONE_USER_ID:
    try {
        //This switch case logic needs refreshToken parameter value.
        console.log(chalk('findRefreshToken>>>(search by user id technique)  data service method>>>[try] block>>>[started] '));
        let query =  `SELECT refresh_token_id,user_id,token, created_at FROM 
              refresh_tokens   WHERE user_id=?`;
            result = await connection.query(query, [userId ]);
    } catch (error) {
        console.log(chalk.red('findRefreshToken>>>(search by user id technique)  data service method>>>[catch] block>>>[started]!!! '));
        console.log(chalk.red(error));
        throw error;
    } finally {
        await connection.release();
        return result; //returns an array
        break;
    }
    }//End of switch
};
//End of findRefreshToken data service method


