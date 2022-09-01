//absencelog.service.js
const mysql  = require('../utils/mysql2');
const chalk = require('chalk');
const util = require('util');
const fns = require('date-fns');
module.exports.updateAbsenceLog =async  ({absenceLogId,description,startDateAndTime,endDateAndTime}) =>  {
    console.log(chalk.greenBright('absencelog.service.js>>>updateAbsenceLog data service method>>>[started]'));
    const connection = await mysql.connection(); 
    try {
        console.log(chalk.greenBright('absencelog.service.js>>>updateAbsenceLog data service method>>>[try] block>>>[started] '));
        console.log(chalk.greenBright('Inspect [absenceLogId] variable before the query begins : [ ' + absenceLogId + ']'));
        let query =  `UPDATE  absencelogs SET description=?, start_date=?, end_date=? WHERE absencelog_id=?;`;
            result = await connection.query(query, [description,startDateAndTime,endDateAndTime,absenceLogId]);
            query=`SELECT * FROM absencelogs WHERE absencelog_id=?`;
            result = await connection.query(query, [absenceLogId]);
            console.log(chalk.greenBright('absencelog.service.js>>>Check [result] variable after SQL to update absencelog record.'));
            console.log(result); //Should be a single element array
            console.log(chalk.greenBright('absencelog.service.js>>>updateAbsenceLog data service method [try] block>>>[finished] '));
            console.log(chalk.greenBright('absencelog.service.js>>>return [result] single element array'));
            return result;
    } catch (error) {
        console.log(chalk.red( 'absencelog.service.js>>>updateAbsenceLog data service method [catch] block>>>[started] '));
        console.log(chalk.red('absencelog.service.js>>>Inspect the [error] variable'));
        console.log(chalk.redBright(error));
        throw error;
    } finally {
        //https://stackoverflow.com/questions/3837994/why-does-a-return-in-finally-override-try
        //Learning note: finally block always executes regardless there is a return result command at the 
        //try block.
        await connection.release(); //Need to release the database connection in the finally block.
        console.log(chalk.greenBright('absencelog.service.js>>>updateAbsenceLog data service method>>>[finally] block>>>[finished]'));
    }

};
//End of updateAbsenceLog  data service method


module.exports.createAbsenceLog =async  ({description,startDateAndTime,endDateAndTime,userId}) =>  {
    console.log(chalk.greenBright('absencelog.service.js>>>createAbsenceLog data service>>>[started]'));
    const connection = await mysql.connection(); 
    try {
        console.log(chalk.greenBright('absencelog.service.js>>>createAbsenceLog data service method>>>[try] block>>>[started] '));
        let query =  `INSERT INTO  absencelogs (description,start_date,end_date,created_by) VALUES (?,?,?,?);`;
            result = await connection.query(query, [description,startDateAndTime.
                replace(/T/, ' ').      
                replace(/\..+/, '')  ,endDateAndTime.
                replace(/T/, ' ').    
                replace(/\..+/, '')   ,userId]);
            query = `SELECT * FROM absencelogs WHERE absencelog_id=?`;
            result = await connection.query(query, [result.insertId]);
            console.log(chalk.greenBright('absencelog.service.js>>>Check [result] variable after creating  new absence log record.'));
            console.log(result); //Should be a single element array
            console.log(chalk.greenBright('absencelog.service.js>>>createAbsenceLog data service method>>>[try] block>>>[finished] '));
            console.log(chalk.greenBright('absencelog.service.js>>>Returning result single element array'));
            return result;
    } catch (error) {
        console.log(chalk.red.bold( 'absencelog.service.js>>>createAbsenceLog data service method [catch] block>>>[started]!!! '));
        console.log(chalk.redBright(util.inspect(error,errorshowHidden=false, depth=2, colorize=true)));
            throw error ;
    } finally {
        //https://stackoverflow.com/questions/3837994/why-does-a-return-in-finally-override-try
        //Learning note: finally block always executes regardless there is a return result command at the 
        //try block.
        await connection.release(); //Need to release the database connection in the finally block.
        console.log(chalk.greenBright('absencelog.service.js>>>createAbsenceLog data service method>>>[finally] block>>>[finished]'));
    }

};
//End of createAbsenceLog data service method

module.exports.deleteAbsenceLog =async  ({absenceLogId}) =>  {
    console.log(chalk.greenBright('absencelog.service.js>>>deleteAbsenceLog data service method>>> [started]'));
    const connection = await mysql.connection();
    try {
        console.log(chalk.greenBright('absencelog.service.js>>>deleteAbsenceLog data service method>>> [try] block>>>[started] '));
        let query =  `DELETE FROM absencelogs WHERE absencelog_id=$1`;
            result = await connection.query(query, [absenceLogId]);
            console.log(chalk.greenBright('absencelog.service.js>>>deleteAbsenceLog data service method>>>Inspect [result] variable '));
            console.log(chalk.bgGrey(util.inspect(result)));
            return result;
    } catch (error) {
        console.log(chalk.red.bold( 'absencelog.service.js>>>deleteAbsenceLog data service method>>> [catch] block>>>[started] '));
             throw error
        }finally{
            await connection.release(); //Need to release the database connection in the finally block.
        console.log(chalk.greenBright('absencelog.service.js>>>deleteAbsenceLog data service method>>>[finally] block'));
    }
};
//End of deleteAbsenceLog data service method

module.exports.findAbsenceLogs =async  ({searchParameters,userId}) =>  {
    const columns = Object.keys(searchParameters);
const values = Object.values(searchParameters);

    console.log(chalk.greenBright('absencelog.service.js>>>findAbsenceLog[s] data service method>>>[started]'));
    const connection = await mysql.connection();
     console.log(chalk.greenBright('findAbsenceLogs data service method>>>[try] block>>>[started] '));
     let sql = 'SELECT * FROM absencelogs WHERE (';
     let params = [];
let i=0;
for ( i = 0; i < values.length; i++) {
    //Use ILIKE instead of LIKE for case insensitive search
    sql += columns[i].replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "") + ' LIKE ? ';
    if (i<values.length-1){
      sql += ' OR ';
    }else if(i===values.length-1){
        sql +=')';
    }
    }
    sql += 'AND created_by=?';
    for (let i = 0; i < columns.length; i++) {
        params = [...params,`%${values[i]}%` ]
    }
    params=[...params,userId];
try{
            let query =  sql;
            console.log(chalk.yellow(query));
               const  result = await connection.query(query,params);
               console.log(chalk.greenBright('absencelog.service.js>>>findAbsenceLogs data service method>>>'));
               console.log(chalk.greenBright('Inspect the [result] variable after making a search query'));
                console.log(chalk.greenBright(util.inspect(result),errorshowHidden=false, depth=2, colorize=true));
  
                return result;
        } catch (error) {
            console.log(chalk.red('absencelog.service.js>>>'));
            console.log(chalk.red( 'findAbsenceLogs data service method>>>[catch] block>>>[started] '));

                throw error
        } finally {
            await connection.release(); //Need to release the database connection in the finally block.
            console.log(chalk.greenBright('absencelog.service.js>>>'));
            console.log(chalk.greenBright('absencelog.service.js>>>findAbsenceLogs data service method>>>[finally] block'));
        }
};
//End of findAbsenceLogs data service method

module.exports.findOneAbsenceLog =async  ({absenceLogId}) =>  {
    console.log(chalk.greenBright('absencelog.service.js>>>findOneAbsenceLog data service method>>>[started]'));
    console.log(chalk.greenBright('Inspect [absenceLogId] variable : ',absenceLogId));
    const connection = await mysql.connection();
    try {
        console.log(chalk.greenBright('absencelog.service>>>findOneAbsenceLog data service method>>>[try] block>>>[started]'));
        let query =  `SELECT * FROM absencelogs WHERE absencelog_id=?`;  
            const result = await connection.query(query, [absenceLogId]);
            return result;
    } catch (error) {
        console.log(chalk.red.bold( 'absencelog.service.js>>>findOneAbsenceLog data service method>>>[catch] block>>>[started]'));
            throw error;
    } finally {
        await connection.release(); //Need to release the database connection in the finally block.
        console.log(chalk.greenBright('findOneAbsenceLog method>>>[finally] block>>>[finished]'));
    }
};
//End of findOneAbsenceLog data service method


