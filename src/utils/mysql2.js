const {databaseConfig} = require('../../config');
const mysql = require('mysql2');
const chalk = require('chalk');
const fs = require('fs');
const util = require('util');
const appRootPath = require('app-root-path');

let databaseConfiguration = {
    host: databaseConfig.host,
    user: databaseConfig.userName,
    password: databaseConfig.password,
    database: databaseConfig.databaseName,
    multipleStatements: false, //Never set this to true because it increase vulnerability
    connectionLimit: 100,
    timezone: 'UTC', //Reference: https://stackoverflow.com/questions/23571110/nodejs-responded-mysql-timezone-is-different-when-i-fetch-directly-from-mysql
    //Zulu Z, UTC, GMT all same value https://www.windy.com/articles/difference-between-utc-gmt-zulu-time-and-z-7872?1.284,103.838,5
    waitForConnections: true,//https://openbase.com/js/mysql2#using-connection-pools
    ssl:{
        rejectUnauthorized:false,
         ca : fs.readFileSync(appRootPath+ '/cert.crt'),
    }
};
console.log(chalk.yellow('mysql2.js>>>Inspect [databaseConfiguration] variable'));
console.log(chalk.yellowBright(util.inspect(databaseConfiguration)));
const pool = mysql.createPool(databaseConfiguration);
const connection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            console.log('mysql2.js>>>Inspect [error]',chalk.red(util.inspect(error)));
            
            if (error){
                reject(error);//Exit
            }
            //The rest of the code below can execute if the condition at line 29 (if(error)...) is indeed false;
            //console.log('mysql2.js>>>',chalk.yellow(util.inspect(connection)));
            //Note that the [connection] object is a PoolConnection type object.
            console.log(chalk.yellow(`mysql2.js>>>MySQL pool connected: threadId ${ connection.threadId}`));
            const query = (sql, binding) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, binding, (error, results,fields) => {
                        if (error) {reject(error);}
                        resolve(results);
                    });
                });
            };
            const release = () => {
                return new Promise((resolve, reject) => {
                    if (error) {reject(error)};
                    console.log(chalk.yellow(`config.js>>>MySQL pool released: threadId ${ connection.threadId}`));
                    resolve(connection.release());
                });
            };
            resolve({ query, release });
        });
    });
};
const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, binding, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

module.exports = { pool, connection, query };