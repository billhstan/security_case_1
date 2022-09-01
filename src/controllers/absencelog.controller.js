
//absencelog.controller.js
const absencelogDataService = require('../services/absencelog.service');
//chalk - for development
const chalk = require('chalk');

//util - for development
const util = require('util');
exports.handleCreateAbsenceLog = async (req,res,next) => {
    console.log(chalk.magenta('absencelog.controller.js>>>'));
    console.log(chalk.magenta( 'handleCreateAbsenceLog route handler method>>>[Started]'));
    //Obtain from the data from req.body
    let { userId=0,description,startDateAndTime,endDateAndTime } = req.body;

    try{
    console.log(chalk.magenta('handleCreateAbsenceLog>>>Calling createAbsenceLog data service method to insert a new record.'));
    const result = await absencelogDataService.createAbsenceLog({userId,description,startDateAndTime,endDateAndTime});
    const processedResult =  {
        absenceLogId: result[0].absencelog_id,
        description:result[0].description,
        startDateAndTime :result[0].start_date,
        endDateAndTime: result[0].end_date,
        createdAt:result[0].created_at,
    };
       return res.status(200).send({ok:true,message:'Completed.',data:processedResult});
    }catch(error) {
        return next(error); 
    }finally{
        console.log(chalk.magenta( 'absencelog.controller.js>>>handleCreateAbsenceLog route handler>>>[Finished]'));
    }
}//End of handleCreateAbsenceLog  route handler

exports.handleSearchOneAbsenceLog = async (req,res,next) => {
    console.log(chalk.magenta( 'absencelog.controller.js>>>handleSearchOneAbsenceLog route handler method>>>[Started]'));
    console.log(chalk.magenta('Inspect the [req.params]'))
    console.log(req.params);
    
    let {absenceLogId} = req.params;
    console.log(chalk.magenta('handleSearchOneAbsenceLog>>>Inspect the [absenceLogId] variable value '), absenceLogId);
    try{
            const result = await absencelogDataService.findOneAbsenceLog({absenceLogId});
            console.log(result);
            const processedResult =   {
                absenceLogId: result[0].absencelog_id,
                description:result[0].description,
                startDateAndTime : result[0].start_date,
                endDateAndTime: result[0].end_date
            };
               return res.status(200).send({ok:true,message:'Completed.',data:processedResult})
            }catch(error) {
                return next(error); 
            }
    }//End of processSearchOneAbsenceLog route handler

exports.handleSearchAbsenceLogs = async (req,res,next) => {
    console.log(chalk.magenta( 'absencelog.controller.js>>>handleSearchAbsenceLogs route handler method>>>[Started]'));

    let {description,startDateAndTime,endDateAndTime} = req.query;
    //There are some validations required for this method.
//Validations on search parameters are heavily influenced by the use cases discussed with customers and users.
//For my use case, an empty string for description search parameter will be treated by the system that, I want
//"all" the absence log records created by a particular user in the session.
    let searchParameters = {};
    //To avoid having undefined inside the dynamic search SQL later.
    searchParameters.description = description?description:'';

    //Note that for this project, I did not apply start date and end date range search logic
    //Therefore, I did not use the following 2 commands:
    //searchParameters.startDate = startDateAndTime?startDateAndTime:''; 
    //searchParameters.endDate = endDateAndTime?endDateAndTime:''; 
    //*********************************************************** */
        try{
            const result = await absencelogDataService.findAbsenceLogs({searchParameters,userId:req.body.userId});
            const processedResult = result.map((element)=>{return {
              absenceLogId: element.absencelog_id,
              description:element.description,
              startDateAndTime : element.start_date,
              endDateAndTime: element.end_date
          }})
          console.log(chalk.magenta('processedResult variable : ') , processedResult);
               return res.status(200).json({ok:true,message:`Completed. ${processedResult.length} log records.`,data:processedResult})
            }catch(error) {
                return next(error);//Capture any error or custom error raised by the brandDataService.findBrands 
            }

    }//End of handleSearchAbsenceLogs route handler


    exports.handleDeleteAbsenceLog = async (req,res,next) => {
        console.log(chalk.magenta( 'absencelog.controller.js>>>handleDeleteAbsenceLog>>>[Started]'));
        console.log('absencelog.controller.js>>>handleDeleteAbsenceLog>>>Retrieving the parameters from the URL');
        let { absenceLogId } = req.params;
        console.log(chalk.yellow('absence log id value received :' + absenceLogId));
        let errors = [];
        /* For secure coding, you have to do a lot of validation here to validate the received data */
        /* If there is any validation rules broken, prepare to raise an error so that a "central logic" can
        process the Error and sends back a standardized response to the client side */
        try{
        const result = await absencelogDataService.deleteAbsenceLog({absenceLogId: absenceLogId});
           return res.status(200).send({ok:true,message:'Completed.',data:[]})
        }catch(error) {
            return next(error); 
        }
          }//End of handleDeleteAbsenceLog route handler

          exports.handleUpdateAbsenceLog = async (req,res,next) => {
            console.log(chalk.magenta('absencelog.controller.js>>>'));
            console.log(chalk.magenta( 'handleUpdateAbsenceLog>>>route handler method>>>[started]'));
            let { description, startDateAndTime,endDateAndTime } = req.body;
            let absenceLogId = req.params.absenceLogId;
            console.log(chalk.magenta( 'absencelog.controller.js>>>handleUpdateAbsenceLog>>>'));
            console.log(chalk.magenta( 'Inspect [absenceLogId]>>>'),absenceLogId);

            try{
            const result = await absencelogDataService.updateAbsenceLog({absenceLogId,description,startDateAndTime,endDateAndTime});
            const processedResult =  {
                absenceLogId: result[0].absencelog_id,
                description:result[0].description,
                startDateAndTime : result[0].start_date,
                endDateAndTime: result[0].end_date
            };
               return res.status(200).send({ok:true,message:'Completed.',data:processedResult});
            }catch(error) {
        
                return next(error); 
            }
        }//End of handleUpdateAbsenceLog  route handler
        
  