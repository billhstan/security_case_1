//ProtectedRoute.js
import React, {useContext,useEffect} from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Context } from '../../Context/appContext';

// We are taking in the component that should be rendered if the user has been authenticated
// We are also passing the rest of the props to the <Route /> component such as the
// exact & the path property (react router v6)
const ProtectedRoute = ({ component: Component, ...rest }) => {
     const { store, actions , setStore} = useContext(Context);
     useEffect(() => {
        console.log('ProtectedRoute.js >>>useEffect[store.authenticatedUser]>>>[Started]');
        console.log('Inspect the store.authenticatedUser:');
       console.log(store.authenticatedUser);
       console.log('ProtectedRoute.js >>>useEffect[store.authenticatedUser]>>>[Finished]');
    }, [store.authenticatedUser]);   

    return (
        <>
        {(store?.authenticatedUser?.isAuthenticated==true)?(
            <Outlet></Outlet>
        ):(
            <Navigate   to='/login'  replace={true}  />
        )}
        </>
    );
}
export default ProtectedRoute;