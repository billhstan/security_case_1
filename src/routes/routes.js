//routes.js

const authController = require('../controllers/auth.controller');
const monitorrefreshtokenController = require('../controllers/monitorrefreshtoken.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const absenceLogController = require('../controllers/absencelog.controller');
module.exports = (app, router) => {
	router.post('/authenticate', authController.handleLogin);

	//The backend logic should clear away the HTTPOnly cookie
	router.get('/logout', authController.handleLogout);

	//The backend logic should clear away the HTTPOnly cookie
	router.get('/refresh', authController.handleRefreshToken);

	//HTTP request testing to see if the web browser client automatically
	//sends back the HTTPFlag only cookie data which has the JWT.
	router.post('/api/absencelogs', verifyAccessToken.verifyToken, absenceLogController.handleCreateAbsenceLog);
	
   router.put('/api/absencelogs/:absenceLogId', verifyAccessToken.verifyToken,absenceLogController.handleUpdateAbsenceLog );
   //Note that, I wanted to combine the logic of handleSearchAbsenceLogs and handleSearchOneAbsenceLog 
   //but I finally split the URL handler method so that the code is more maintenable.
   router.get('/api/absencelogs/', verifyAccessToken.verifyToken, absenceLogController.handleSearchAbsenceLogs);
   router.get('/api/absencelogs/:absenceLogId', verifyAccessToken.verifyToken, absenceLogController.handleSearchOneAbsenceLog);
   router.delete('/api/absencelog/:absenceLogId', verifyAccessToken.verifyToken,absenceLogController.handleDeleteAbsenceLog );



	//HTTP request testing to check total number of refresh token in the database for a specify user
	router.get('/refreshtoken/check/:userId', monitorrefreshtokenController.handleCheckRefreshToken);
};