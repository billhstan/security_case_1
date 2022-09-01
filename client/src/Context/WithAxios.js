// WithAxios.js
//Important reference (don't loose it):https://stackoverflow.com/questions/64296505/usecontext-inside-axios-interceptor

import { useContext, useMemo } from 'react';
import { Context } from './appContext';
import axios from 'axios'

const WithAxios = ({ children }) => {
    const { store, actions , setStore} = useContext(Context);
    useMemo(() => {
// Response interceptor for API calls
axios.interceptors.response.use((response) => {
	return response
  }, async function (error) {
	const originalRequest = error.config;
	console.log(`WithAxios.js>>>Interceptor logic detects that the HTTP request for ${originalRequest.url} has failed. Quickily check the error.config >>>> `);
	console.log('WithAxios.js>>>Inspect error.config >>>> ', originalRequest);
	if (error.response.status === 403 ) {
	  console.log('WithAxios.js>>>Interceptor logic has detected 403 status Forbidden>>>> ');
	  console.log('WithAxios.js>>>Interceptor logic makes a request to end point /api/refresh ');
	  //content-type: defines the type of response obtained from the backend
	  return axios.get('/refresh', {
		headers: { 'Content-Type': 'application/json' },
		withCredentials: true,
	  }).then((res) => {
		if (res.status === 200) {
		  console.log(`WithAxios.js>>>/api/refresh response status is ${res.status}.');
		  console.log('WithAxios.js>>>Client side receives new access token (and refresh token). As long as refresh token did not expire.`);
		  console.log('WithAxios.js>>>Obtained new access token (and new refresh token). Make a retry on the original HTTP request.');
		  const retryOrigReq = new Promise((resolve, reject) => {
			  resolve(axios(originalRequest));
		  });
		  return retryOrigReq;
		}
	  }).catch((error)=>{
		//I dare not use status code 403 (Forbidden) anymore for my server-side 
		//processRefreshToken handler's response because the 
		//interceptor detects for 403 (Forbidden) and the logic ends up making 
		//another /api/refresh end point call again.
		//Note: There are other better ways of doing things. Need to keep a look out on 
		//YouTube, articles or even github public repo shared by other developers.
		if (error.response?.status == 401){
		  console.log('WithAxios.js>>>Interceptor detected UnAuthorized response when trying to request for new access and refresh token');
		  console.log('WithAxios.js>>>The catch block has command, actions.logout(). This command shall execute. Global state is updated.');
		  console.log('WithAxios.js>>>The automatic navigation to Login view will occur due to the logic inside the ProtectedRoute.js');
		  console.log('WithAxios.js>>>Inspect the [error.response]');
		  console.dir(error.response);

		  actions.logout();
		  } 
	  });
  
	}else{
	console.log('WithAxios.js>>>I have absolutely no idea what to do here. Need more sleep to think this through.');
	console.log('WithAxios.js>>But it does not affect the client-side application state');
	return Promise.reject(error);
	}
  });

 }, [actions])
    return children
}

export default WithAxios;
