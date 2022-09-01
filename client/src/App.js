import './App.css';
//Reference: https://www.freecodecamp.org/news/how-to-use-react-router-version-6/
//Some changes were done to make React Router available anywhere in the application.
import {BrowserRouter as Router,Routes,Route, Link} from 'react-router-dom';
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import AbsenceLogs from './Pages/AbsenceLogs/AbsenceLogs';
import AddAbsenceLog from './Pages/AddAbsenceLog/AddAbsenceLog';
import UpdateAbsenceLog from './Pages/UpdateAbsenceLog/UpdateAbsenceLog';
import ManageAbsenceLogs from './Pages/ManageAbsenceLogs/ManageAbsenceLogs';
import NoMatch from './Pages/NoMatch/NoMatch';
import Header from './Components/Header/Header';
import ProtectedRoute from './Components/ProctectedRoute/ProctectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import injectContext from './Context/appContext';

function App() {
  return (

    <Router>
      <Header></Header>
      <Routes>
        <Route path="/" element={ <Landing/ > } />
        <Route path="/landing" element={ <Landing/ > } />
           <Route path="/login" element={ <Login/ > } />

           <Route exact path='/' element={<ProtectedRoute/>}>
           <Route path="absencelogs" element={<AbsenceLogs />}>
							<Route index element={<ManageAbsenceLogs />} />
							<Route path=":absenceLogId" element={<UpdateAbsenceLog />} />
							<Route path="add" element={<AddAbsenceLog />} />
              <Route path="*" element={<NoMatch />} />
						</Route>
            </Route>

        <Route path="*" element={ <NoMatch/ > } />
      </Routes>
    </Router>
 
  );
}

export default injectContext(App);
