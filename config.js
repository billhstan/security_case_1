require('dotenv').config();
const util = require('util');
const chalk = require('chalk');
let databaseConfig=null;
//To force your project to connect to the database in your own computer local environment, 
//localhost, you just need to comment out the PORT environment variable.
if ( process.env.NODE_ENV=='production') {
    console.log(chalk.magenta('config.js>>>NODE_ENV is not \'development\'>>>Connect to Heroku DB'));
     databaseConfig = {
        userName: process.env.REMOTE_DB_USERNAME,
        password: process.env.REMOTE_DB_PASSWORD,
        databaseName: process.env.REMOTE_DB_DATABASENAME,
        host:process.env.REMOTE_DB_HOST,
        ssl : { rejectUnauthorized: false }
    };
}else{
    console.log(chalk.magenta('config.js>>>NODE_ENV is \'development\'>>>Use local database'));
    console.log(chalk.magenta('config.js>>>Developer wants the backend use the localhost database.'));
    databaseConfig = {
        userName: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        databaseName: process.env.DEV_DB_DATABASENAME,
        host:process.env.DEV_DB_HOST,
    };
}
//Double checked the databaseConfig. By using the console.log statement.
  console.log('>>>config.js>>Inspect the database connection parameters.');
  console.log(chalk.magenta(util.inspect(databaseConfig))); 
module.exports = {
    databaseConfig,
    JWTAccessTokenKey: process.env.JWT_ACCESS_TOKEN_KEY,
    JWTRefreshTokenKey:process.env.JWT_REFRESH_TOKEN_KEY,
    cookie_secret:process.env.COOKIE_SECRET,
    cryptr_secret:process.env.CRYPTR_SECRET   
}
