import {useState, useEffect, useContext } from 'react';
import styles  from  './Login.module.css';
//------------------------------------------------------------------------------------------------------------------------------
//Login.js uses the react-hook-form to manage the form input state.
//The youtube shares how an author uses the term hook when he was demonstrating
//importing hooks in his code. 
//E.g. Import a special function, or you can say "a hook". This hook helps you gather/track the form input values.
//https://youtu.be/FY8sXCsjvf8?t=547
//------------------------------------------------------------------------------------------------------------------------------
import { useForm } from 'react-hook-form';
import { Alert } from 'react-bootstrap';
import { Context } from '../../Context/appContext';


const Feedback = ({serverSideFeedback})=>{
	console.log('Login.js>>>Feedback>>>[Started]');
    const {ok,errors,message}=serverSideFeedback;
    console.log('Login.js>>>Feedback>>>Check the three inputs:');
    console.log('[ok] variable value: ',ok);
    console.log('The ok input parameter should have either, null, true or false. As a result, you need to be careful with the conditional statement.');
    console.log((ok==null)?'The ok input is null. Therefore the the else block should execute. ':'The ok input is not null, something else should be displayed.');
    console.log(message?message:'The message variable is empty string');
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

function Login() {
	const { store, actions , setStore} = useContext(Context);
    console.log('>>>Login functional component : >>>');
	const formOptions = {
		email: { required: 'Email is required' },
		password: {
			required: 'Password is required',
		},
	};
	const {
		register,
		handleSubmit,
		setFocus,
		setValue,
		formState: { errors, isValidating,isSubmitting },
	} = useForm(formOptions);


    useEffect(() => {
		console.log('Login.js>>>useEffect[setFocus]>>>[Started]>>>setFocus(\'email\')')
		 setFocus('email');
		}, [setFocus]);
  
	//If change the following useEffect dependency to isSubmitting. Things are going to be bad.
	useEffect(() => {
		console.dir('>>>Login.js>>>useEffect[isValidating]>>>[Started]>>>')
		console.dir('Call the actions.clearServerSideFeedback'	);
		actions.clearServerSideFeedback();
		console.log(
			'Login.js>>>useEffect[isValidating]>>>Has executed to clear store.serverSideFeedback>>>[Finished]');
	}, [isValidating]);
	useEffect(()=>{
		setValue('email','tan.bee.leng.jessie@skill.com.sg');
		setValue('password','');//Mysterious problem: If I preset the password, it can auto become uppercase
	},[])

const onSubmit = async (data) => {
		console.log('Login.js>>>onSubmit>>>[Started]>>Inspect the [data] variable inside the onSubmit method>>>');
		console.log(data);
		await actions.login({email:data.email,password:data.password});
		console.log('Login.js>>>onSubmit>>>[Finished]');
	};

	return (
		<div className='container-fluid h-100 d-flex flex-column'>
			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-8 offset-sm-2 border border-secondary'>
				<div><li>zhi.wei.david.yeo@skill.com.sg</li><li>tan.bee.leng.jessie@skill.com.sg</li><li>ann.low@skill.com.sg</li></div>
				</div>
				</div>
				<div className='row border border-secondary  p-1 m-1'>

				<div className='col-sm-2'></div>
				<div className='col-sm-8 p-1 m-1 text-start border'>
					<h3 className=''>Login</h3>
				</div>
				<div className='col-sm-2'></div>
			</div>
			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-2'></div>
				<div className='col-sm-8 p-1 m-1 text-start border' style={{ height: '120px' }}>
					<Feedback serverSideFeedback={store.serverSideFeedback} />
				</div>
				<div className='col-sm-2'></div>
			</div>

			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-2   border border-secondary'></div>

					<form onSubmit={handleSubmit(onSubmit)} className="col-sm-8  align-self-center  p-3  border border-primary">
						<div className='form-group row   justify-content-center'>
							<label className='col-sm-2 col-form-label text-end' htmlFor='email'>
								Email
							</label>
							<div className='col-sm-4 border border-secondary'>
								<input type='text' name='email' autoComplete='off' className='form-control form-control-sm mt-4' {...register('email', formOptions.email)} />
								<small className='m-4 text-danger'>
									{/** https://youtu.be/FY8sXCsjvf8?t=1021  */}
									{errors?.email && errors.email.message}
								</small>
							</div>
						</div>
						<div className='form-group row justify-content-center mt-2'>
							{/*https://getbootstrap.com/docs/5.0/utilities/text/ */}
							<label className='col-sm-2 col-form-label text-end' htmlFor='password'>
								Password
							</label>
							<div className='col-sm-4  border border-secondary'>
								<input className='form-control form-control mt-4' type='password' name='password' {...register('password', formOptions.password)} />

								<small className='m-4 text-danger'>{errors?.password && errors.password.message}</small>
							</div>
						</div>
						<div className='d-flex flex-row-reverse'>
							<button className='btn btn-primary mt-1' disabled={isSubmitting}>
								Sign In
							</button>
						</div>
					</form>

				<div className='col-sm-2 border border-secondary'></div>
			</div>
			<div className='row border border-secondary  p-1 m-1'>
				<div className='col-sm-2   border border-secondary'></div>
				{/*Spent sometime experimenting on d-flex, fex-column, m, p and text-center*/}
				<div className='col-sm-8 d-flex flex-column text-center  p-2 border'>
					<div className='align-self-center border border-secondary w-50 m-2'>
						You need to create an account before reporting to Internship company.
						<div >
							<a href='#' className='link-primary'>
								Start registering for a student account.
							</a>
						</div>
					</div>
					<div className='align-self-center border border-secondary w-50 m-2'>
						Forgot password?
						<div>
							<a href='#' className='link-primary'>
								Reset password
							</a>
						</div>
					</div>
				</div>
				<div className='col-sm-2  border border-secondary'></div>
			</div>
		</div>
	);
}

export default Login;
