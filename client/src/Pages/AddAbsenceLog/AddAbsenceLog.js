import React,{useState, useEffect, useContext } from 'react';
import styles  from  './AddAbsenceLog.module.css';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-bootstrap';
import { Context } from '../../Context/appContext';
import { Link } from 'react-router-dom';
//import H from '../../Helpers/Helper';

const Feedback = ({serverSideFeedback})=>{
    const {ok,errors,message}=serverSideFeedback;
    console.log('AddAbsenceLog.js>>>Feedback>>>Check the three inputs:');
    console.log('Inspect the [ok] variable');
    console.log(ok);
    console.log('The ok input parameter should have either, null, true or false. As a result, you need to be careful with the conditional statement.');
    console.log((ok==null)?'The ok input is null. Therefore the the else block should execute. ':'The ok input is not null, something should be displayed.');
    console.log('Inspect the [message] variable');
    console.log(message?message:'The message variable is empty string');
    console.log('Inspect the [errors] variable');
    console.dir(errors?errors:'The errors is null.');
    if (ok==true) {
      return (
        <Alert role="alert" className="alert alert-success h-100" variant="success">
          {message}
        </Alert>
      );
    } else if ((ok==false) && message.trim() != '' && errors?.length > 0) {
      return (
        <Alert role="alert" className="alert alert-danger h-100" variant="danger">
          {message}
          {errors.map((element, index) => (
            <p key={index}>{element.message}</p>
          ))}
        </Alert>
      );
    } else if ((ok===false) && message.trim() != '' && errors?.length == 0) {
      return (
        <Alert role="alert" className="alert alert-danger h-100" variant="danger">
          {message}
        </Alert>
      );
    } else {
      return (
        <Alert role="alert" className="h-100" variant="info">
          {message}
        </Alert>
      );
    }
  };
function AddAbsenceLog() {
    const { store, actions , setStore} = useContext(Context);
	console.log('AddAbsenceLog.js>>>[started]');
	const formOptions = {
		description: { required: 'Description is required' },
		startDateAndTime: {
			required: 'Start date and time is required',
            /*Programmer note: I did not put in date-time format checking validation.
            //Need to put them inside the Helper.js
            */
            /*
			validate:{
				value: (value)=>{return H.validateDateTimeFormat(value)?true:'Start date and time should have a format :'},
			}
            */
		},
	};
	const {
		register,
		handleSubmit,
		setFocus,
		formState: { errors, isValidating,isSubmitting },
	} = useForm(formOptions);

	useEffect(() => {
		console.log('AddAbsenceLog.js>>>useEffect>>>has executed to setFocus(\'description\')');
		setFocus('description');
	}, [setFocus]);
	//If change the following useEffect dependency to isSubmitting. Things are going to be bad.
	useEffect(() => {
		console.dir('AddAbsenceLog.js>>>useEffect[isValidating]>>>Call the actions.clearDataOperationStatus'	);
		actions.clearServerSideFeedback();
		console.log(
			'AddAbsenceLog.js>>>useEffect[isValidating]>>>Has executed to clear store.dataOperationStatus');
	}, [isValidating]);

	const onSubmit = async (data) => {
		try {
            console.dir('AddAbsenceLog.js>>>onSubmit(data)>>>[Started]>>>Inspect the [data] variable'	);
			console.dir(data);
			//Convert user given local time to UTC which the server side database needs.
			//Reference: https://stackoverflow.com/questions/948532/how-to-convert-a-date-to-utc
			var isoStartDateString = new Date(data.startDateAndTime).toISOString();
			var isoEndDateString = new Date(data.endDateAndTime).toISOString();
			await actions.addAbsenceLog({description:data.description,
                startDateAndTime:isoStartDateString,
                endDateAndTime:isoEndDateString});
                console.dir('AddAbsenceLog.js>>>onSubmit(data)>>>[Finished]>>>Inspect the [data] variable'	);
		} catch (err) {
			console.log('>>>onSubmit method catch block>>>');
            console.log('I don\'t know what to write in this catch block.');
			console.dir(err);
		}
	};

	return (
		<div className="container-fluid h-100 d-flex flex-column">
		<div className="row border border-secondary  p-1 m-1">
			<div className="col-sm-2"></div>
			<div className="col-sm-8 p-1 m-1 text-start border">
					<h3 className="">Add absence log</h3>
			</div>
			<div className="col-sm-2"></div>		
		</div>
		<div className="row border border-secondary  p-1 m-1">
			<div className="col-sm-2"></div>
			<div className="col-sm-8 p-1 m-1 text-start border"  style={{height: '120px'}}>
			<Feedback serverSideFeedback={store.serverSideFeedback}/>
			</div>
			<div className="col-sm-2"></div>		
		</div>
	
		<div className="row border border-secondary  p-1 m-1">
		<div className="col-sm-2"></div>
<div className="col-sm-8 align-item-center p-2" >
	<form onSubmit={handleSubmit(onSubmit)}>
						<div className="form-group row justify-content-center">
							<label  className="col-sm-2 col-form-label text-end" htmlFor="description">Description</label>
                            <div className="col-sm-6 text-start">                         
							<input
								type="text"
								autoComplete="off"
								className="form-control form-control-sm"
								{...register('description', formOptions.description)}
							/>
							<small className="m-2 text-danger">
                                {/** https://youtu.be/FY8sXCsjvf8?t=1021  */}
								{errors?.description && errors.description.message}
							</small>
                            </div>   
						</div>
						<div className="form-group row justify-content-center">
                            {/*https://getbootstrap.com/docs/5.0/utilities/text/ */}
							<label className="col-sm-2 col-form-label text-end" htmlFor="startDateAndTime">Start date/time</label>
                            <div className="col-sm-6 text-start">
							<input
								className="form-control form-control"
								type="text"
								{...register('startDateAndTime', formOptions.startDateAndTime)}
							/>
							<small className="m-2 text-danger">
								{errors?.startDateAndTime && errors.startDateAndTime.message}
							</small>
                            </div>
						</div>
						<div className="form-group row justify-content-center">
							<label className="col-sm-2 col-form-label text-end" htmlFor="startDateAndTime">End date/time</label>
                            <div className="col-sm-6 text-start">
							<input
								className="form-control form-control"
								type="text"
								{...register('endDateAndTime', formOptions.endDateAndTime)}
							/>
							<small className="m-2 text-danger">
								{errors?.endDateAndTime && errors.endDateAndTime.message}
							</small>
                            </div>
						</div>
						<div className="d-flex flex-row-reverse">
							<button className="btn btn-primary mt-1" disabled={isSubmitting}>Submit</button>
							&nbsp;
							<Link className='btn btn-primary mt-1 p-2 d-block' to='/absencelogs'>
								Back to Manage absence logs
							</Link>
						</div>
					</form>
			
					</div>
					<div className="col-sm-2"></div>
</div>
</div>
	);
}

export default AddAbsenceLog;
