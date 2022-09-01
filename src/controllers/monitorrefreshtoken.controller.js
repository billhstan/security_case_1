//monitorrefreshtoken.controller.js
const monitorrefreshtokenDataService = require('../services/monitorrefreshtoken.service');
const {DbOption} = require('../config/dbservice.enums');
const chalk = require('chalk');

exports.handleCheckRefreshToken = async (req,res) => {
//This route handler method is used by Postman to check the database.
//This route handler method is not needed by the client-side frontend React JS logic.
    console.log(chalk.hex('#f70bf7')('monitorrefreshtoken.controller.js>>>'));
    console.log(chalk.hex('#f70bf7')(' handleCheckRefreshToken controller method>>>[started]'));
    //This block of code will not work if there is missing userId in the req.body (verifyToken logic failed to get the data from accessToken cookie)
    userId = req.params.userId;
    const results = await monitorrefreshtokenDataService.findRefreshToken({userId,actionType:DbOption.FIND_ALL_TIED_TO_ONE_USER_ID});
    if  (results.length>=1){
                 return res.status(200).send({status:200,message:'',data:results}); //return raw mysql results
            } else {
        console.log(chalk.hex('#f70bf7')('>>>handleCheckRefreshToken controller method (else block for results.length>=1) '));
        return res.status(200).send({status:500,message:'Empty results',data:[]});
    }
}
