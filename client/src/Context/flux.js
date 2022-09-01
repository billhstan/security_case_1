import axios from 'axios';
const baseUrl = '';

//I could not get the interceptor logic work withn the context api environment. Finally, I discovered the following
//online discussion which has led me to create additional JS files to support the refresh token security use case 
//flow.
//https://stackoverflow.com/questions/64296505/usecontext-inside-axios-interceptor

const getState = ({ getStore, setStore, getActions }) => {
	return {
		store: {
			authenticatedUser: localStorage.getItem('authenticatedUser') ?
				 JSON.parse(localStorage.getItem('authenticatedUser')) :
				  { userFullName: '', userEmail: '', isAuthenticated: false },
			serverSideFeedback: { ok: null, message: '', errors: [], data: [] },
			absenceLogs: localStorage.getItem('absenceLogs') ? 
				JSON.parse(localStorage.getItem('absenceLogs')) : [],
			absenceLog: localStorage.getItem('absenceLog') ? 
				JSON.parse(localStorage.getItem('absenceLog')) : 
				{ absenceLogId: 0, startDateAndTime: '', endDateAndTime: '' },
		},
		actions: {
			clearServerSideFeedback: () => {
				console.log('clearServerSideFeedback>>>[Start]>>clear the localStorage \n', 
				'which has serverSideFeedback and reset the store.serverSideFeedback');
				localStorage.setItem('serverSideFeedback', JSON.stringify({ ok: null, message: '', errors: [], data: [] }));
				setStore({
					serverSideFeedback: { ok: null, message: '', errors: [], data: [] },
				});
			},

			getOneAbsenceLog: async ({ absenceLogIdForSearch }) => {
				//For this project, I have set an assumption (fictitious assumption) that
				//the absence log data in the client-side context cannot be treated as "most current"
				//because someone else might have modified the record at the backend
				//database. As a result, getOneAbsenceLog logic won't obtain the absence log data from
				//the absenceLogs store in the context. The logic makes a GET method HTTP request
				//to fetch a fresh record from the backend.
				try {
					console.dir('flux.js>>>getOneAbsenceLog>>>[try block]>>>[Started]');
					console.dir(absenceLogIdForSearch);
					const response = await axios.get(baseUrl + '/api/absencelogs/' + absenceLogIdForSearch, {
						headers: { 'Content-Type': 'application/json' },
						withCredentials: true,
					});
					console.dir('flux.js>>>getOneAbsenceLog>>>Inspect [response.data.data]>>>');
					console.dir(response?.data?.data);

					//I copied the code from getAbsenceLogs
					//I did not modify the code much, because I know I need to build
					//just one single object
					const { absenceLogId, description, startDateAndTime, endDateAndTime } = response.data.data;
					//Update the localStorage (absenceLog) first before updating the store
					localStorage.setItem(
						'absenceLog',
						JSON.stringify({
							absenceLogId: absenceLogId,
							description: description,
							startDateAndTime: startDateAndTime,
							endDateAndTime: endDateAndTime,
						})
					);
					setStore({ absenceLog: { absenceLogId, description, startDateAndTime:startDateAndTime, 
						endDateAndTime:endDateAndTime } });
					console.dir('flux.js>>>getOneAbsenceLog>>>[try block]>>>[Finished]');
				} catch (error) {
					console.dir('flux.js>>>getOneAbsenceLog>>>[catch block]>>>[Executed!!]');
					console.dir('flux.js>>>getOneAbsenceLog>>>Inspect [error.response.data] variable');
					console.dir(error.response.data); 
					console.log('flux.js>>>getOneAbsenceLog>>>serverSideFeedback state is updated with error.response.data');
					localStorage.setItem('serverSideFeedback', JSON.stringify(error.response.data));
					setStore({ serverSideFeedback: error.response.data });
					console.dir('flux.js>>>getOneAbsenceLog>>>[catch block]>>>[Finished]');
				}
			}, //End of getOneAbsenceLog
			getAbsenceLogs: async () => {
				try {
					console.dir('flux.js>>>getAbsenceLogs>>>[try block]>>>[Started]');
					const response = await axios.get(baseUrl + '/api/absencelogs', {
						headers: { 'Content-Type': 'application/json' },
						withCredentials: true,
					});
					console.log(response?.data?.data);
					let dataArray = [];
					response.data.data &&
						response.data.data.forEach((absenceLog) => {
							dataArray.push({
								absenceLogId: absenceLog.absenceLogId,
								description: absenceLog.description,
								startDateAndTime: absenceLog.startDateAndTime,
								endDateAndTime: absenceLog.endDateAndTime,
							});
						});
					//Update the store
					localStorage.setItem('absenceLogs', JSON.stringify(dataArray));
					console.dir(`flux.js>>>getAbsenceLogs>>>[try] block>>>
                    setStore>>> update the absenceLogs in the store.`);
					setStore({ absenceLogs: dataArray });
					const { ok, message, data, errors = [] } = response.data;
					console.dir(`flux.js>>>getAbsenceLogs>>>[try] block>>>
                    setStore>>>update the server feedback response in the store.`);
					setStore({ serverSideFeedback: { ok, message, errors } });
					console.dir({ ok, message, data, errors });
					console.dir('flux.js>>>getAbsenceLogs>>>[try] block>>>finished');

					
				} catch (error) {
					console.dir('flux.js>>>getAbsenceLogs>>>[catch] block>>>[executed]!!');
					console.dir('flux.js>>>getAbsenceLogs>>>Inspect the [error] variable>>>[started]');
					console.dir(error);
					console.dir('flux.js>>>getAbsenceLogs>>>Inspect the [error] variable>>>[finished]');
					console.log('flux.js>>>getAbsenceLogs>>>serverSideFeedback state is updated with [error.response.data]');
					localStorage.setItem('serverSideFeedback', JSON.stringify(error.response.data));
					setStore({ serverSideFeedback: error.response.data });
					console.dir('flux.js>>>getAbsenceLogs>>>[catch] block>>>[finished]');
				}
			}, /*End  of getAbsenceLogs */

			login: async ({ email, password }) => {
				console.log('flux.js>>>login>>>axios.post>>>[started]');
				console.log(`email : ${email} password: ${password}`);
				const payLoad = { email: email, password: password };
				try {
					const response = await axios.post('/authenticate', JSON.stringify(payLoad), {
						headers: { 'Content-Type': 'application/json' },
						withCredentials: true,
					});
					console.dir('flux.js>>>login>>>axios.post>>>[finished]');
					console.dir(`flux.js>>>login>>>Inspect the [response.data] object after `);
					console.dir(`axios.post made a request to the login REST API endpoint`);
					console.dir(response);

					const data = response.data;
					//If you check the auth.controller.js code, the response code has ok, message properties
					//If you check the auth.controller.js code, the response code has fullName, email, isAuthenticated properties
					const { fullName, email, isAuthenticated, ok, message } = data;
					//JWT token is automatically captured by the web browser as a HTTPOnly cookie.
					//JWT token is not stored inside sessionStorage and localStorage
					localStorage.setItem('authenticatedUser', JSON.stringify({ fullName: fullName, email: email, isAuthenticated: isAuthenticated }));

					setStore({ authenticatedUser: { fullName: fullName, email: email, isAuthenticated: isAuthenticated } });
					setStore({ serverSideFeedback: { ok, message, errors: [], data: [] } });
					console.dir('flux.js>>>login>>>[try] block>>>[finished]');
				} catch (error) {
					console.dir('flux.js>>>login>>>[catch] block>>>[executed]!!');
					console.dir('flux.js>>>login>>>Inspect the [error] variable>>>[started]');
					console.dir(error);
					console.dir('flux.js>>>login>>>Inspect the [error] variable>>>[finished]');
					console.log('flux.js>>>login>>>serverSideFeedback state is updated with [error.response.data]');
					localStorage.setItem('serverSideFeedback', JSON.stringify(error.response.data));
					setStore({ serverSideFeedback: error.response.data });
					console.dir('flux.js>>>login>>>[catch] block>>>[finished]');
					console.log(`flux.js>>>login>>>authenticatedUser state will not be updated. It will remain the same.`);
				}
			} /*End of login*/,
			logout: async () => {
				try{
				//https://stackoverflow.com/questions/43002444/make-axios-send-cookies-in-its-requests-automatically
				//Stuck here for hours because I forgot that, axios don't [automatically] send cookies for HTTP GET request.
				const response = await axios.get('/logout', { withCredentials: true });
				localStorage.setItem('authenticatedUser', JSON.stringify({ userFullName: '', userEmail: '', isAuthenticated: false }));
				setStore({ authenticatedUser: { fullName: '', email: '', isAuthenticated: false } });
				}catch(error){
					//At first, I never bothered to put in a try-catch block for the logout method because it is just a... logout.
					//Only after several days later I noticed that an Response status 500, 403 etc can occur because
					//the client-side don't have cookies at all.
					//So,....I just want to logout right? I copy and paste the code in try block to here again.
					localStorage.setItem('authenticatedUser', JSON.stringify({ userFullName: '', userEmail: '', isAuthenticated: false }));
					setStore({ authenticatedUser: { fullName: '', email: '', isAuthenticated: false } });
				}
			} /*End of logout*/,

			addAbsenceLog: async ({ description, startDateAndTime, endDateAndTime }) => {
				console.dir('flux.js>>>addAbsenceLog>>>[started]');
				try {
					const response = await axios.post(
						baseUrl + '/api/absencelogs',
						JSON.stringify({
							description: description,
							startDateAndTime: startDateAndTime,
							endDateAndTime: endDateAndTime,
						}),
						{
							headers: { 'Content-Type': 'application/json' },
							withCredentials: true,
						}
					);
					console.dir('flux.js>>>addAbsenceLog>>>axios.post>>>[finished]');
					console.dir(`Inspect the [response.data] object after axios.post to create one absence log record`);
					console.dir(response.data);
					const { ok, message, data, errors = [] } = response.data;
					localStorage.setItem('serverSideFeedback', JSON.stringify({ ok, message, errors }));
					localStorage.setItem(
						'absencelog',
						JSON.stringify({
							absenceLogId: data.absenceLogId,
							startDateAndTime: data.startDateAndTime,
							endDateAndTime: data.endDateAndTime,
						})
					);
					setStore({ serverSideFeedback: response.data });

					setStore({
						absenceLog: {
							absenceLogId: data.absenceLogId,
							startDateAndTime: data.startDateAndTime,
							endDateAndTime: data.endDateAndTime,
						},
					});
					console.dir('flux.js>>>addAbsenceLog>>>[try block]>>>[finished]');
				} catch (error) {
					console.dir('flux.js>>Inspect the [error] variable.');
					console.dir(error);
					console.log('flux.js>>>addAbsenceLog>>>[catch block]>>>[executed!!]');
					console.log('flux.js>>>addAbsenceLog>>>axios post>>>[failed]');
					console.dir(error.response.data);
					console.log(`flux.js>>>addAbsenceLog>>>serverSideFeedback state is updated with error.response.data`);
					localStorage.setItem('serverSideFeedback', JSON.stringify(error.response.data));
					setStore({ serverSideFeedback: error.response.data });
				}
			}, //End of addAbsenceLog
			updateAbsenceLog: async ({ absenceLogId, description,startDateAndTime,endDateAndTime }) => {
				try {
					console.dir('flux.js>>>updateAbsenceLog>>>[Started]');
					//https://javascript.plainenglish.io/react-tips-async-and-setstate-cb539ad62135
					//setStore({ serverSideFeedback: null });
					//Should not do the above command inside the updateAbsenceLog method because setStore is async
					//The original intension was to reset the serverSideFeedback inside the store so that
					//any feedback messages in the Update, Add or Manage brand views are reset.
					//Unfortunately the idea of using the above statement (commented out), is not appropriate.
					//https://levelup.gitconnected.com/react-hooks-gotchas-setstate-in-async-effects-d2fd84b02305
					const response = await axios.put(
						baseUrl + '/api/absencelogs/' + absenceLogId,
						JSON.stringify({
							absenceLogId: absenceLogId,
							description: description,
							startDateAndTime: startDateAndTime,
							endDateAndTime: endDateAndTime,
						}),
						{
							headers: { 'Content-Type': 'application/json' },
							withCredentials: true,
						}
					);
					console.dir('flux.js>>>updateAbsenceLog>>>axios.put>>>[finished]');
					console.dir('Inspect the [response.data] object after axios.put to update a absenveLog record');
					console.dir(response.data);
					//https://stackoverflow.com/questions/58587779/react-hook-replacing-old-state
					//You don't need to worry about the impact on how the state content changes because
					//you are "replacing everything" with a new object.

					//Update localStorage first
					const { ok, message, data, errors = [] } = response.data;
					localStorage.setItem('serverSideFeedback', JSON.stringify({ ok, message, errors }));
					localStorage.setItem(
						'absenceLog',
						JSON.stringify({
							absenceLogId: data.absenceLogId,
							description: data.description,
							startDateAndTime: data.startDateAndTime,
							endDateAndTime: data.endDateAndTime
						})
					);
					//Update the state
					setStore({ serverSideFeedback: response.data });
					setStore({
						absenceLog: {
							absenceLogId: data.absenceLogId,
							description: data.description,
							startDateAndTime: data.startDateAndTime,
							endDateAndTime: data.endDateAndTime
						},
					});
				} catch (error) {
					//Note that, the backend response information are all inside error.response.data
					console.log('flux.js>>>updateAbsenceLog>>>[catch] block>>>[executed]!!');
					console.log('flux.js>>>updateAbsenceLog>>>axios put [Failed]>>>Inspect the [error.response.data]');
					console.dir(error.response.data);
					console.log('flux.js>>>updateAbsenceLog>>>serverSideFeedback state is updated with [error.response.data]');
					localStorage.setItem('serverSideFeedback', JSON.stringify(error.response.data));
					setStore({ serverSideFeedback: error.response.data });
				}
			}, //End of updateAbsenceLog

			deleteAbsenceLog: async ({absenceLogId }) => {
				try {
					console.log('flux.js >>>deleteAbsenceLog>>>[started]');
					console.log('flux.js >>>deleteAbsenceLog>>>Check the [absenceLogId] input :  ', absenceLogId);
					const response = await axios.delete(baseUrl + '/api/absencelog/' + absenceLogId, {
						headers: { 'Content-Type': 'application/json' },
						withCredentials: true,
					});
					//Update localStorage first
					localStorage.setItem('serverSideFeedback', JSON.stringify(response.data));
					//Update the state
					setStore({ serverSideFeedback: response.data });

					console.dir('flux.js>>>deleteAbsenceLog');
					console.dir('Inspect the [response.data] object after axios.delete to delete a absenceLog record');
					console.dir(response.data);
					localStorage.setItem('serverSideFeedback', JSON.stringify(response.data));
					setStore({ serverSideFeedback: response.data });
					console.dir('flux.js>>>deleteAbsenceLog>>>Call getActions().getAbsenceLogs() to retrieve a fresh set of records.');
					getActions().getAbsenceLogs();
					console.dir('flux.js>>>deleteAbsenceLog>>>[finished]');
				} catch (error) {
					console.log('flux.js>>>deleteAbsenceLog>>>[catch] block>>>[executed]!!.');
					console.log('flux.js>>>deleteAbsenceLog>>>axios.delete>>>[failed]!!!');
					console.log('flux.js>>>deleteAbsenceLog>>>Inspect the [error.response.data]');
					console.dir(error.response.data);
					console.log('flux.js>>>deleteBrand>>>serverSideFeedback state is updated with [error.response.data]');
					localStorage.setItem('serverSideFeedback', JSON.stringify(error.response.data));
					setStore({ serverSideFeedback: error.response.data });
				}
			}, //End of deleteAbsenceLog
		},
	};
};

export default getState;
