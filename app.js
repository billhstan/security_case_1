const express = require("express");
const cors = require('cors')
const routes = require('./src/routes/routes')
const app = express();
const cookieParser = require('cookie-parser');
const config = require("./config");
const path = require('path');
const bodyParser = require('body-parser');
//The cors usage requires review to ensure it is properly used.
//At the time of coding on 5 Aug 2022, I did not pay much attention to the following code
//. I just make sure the entire project backend logic satisfies the main use case flow first.
app.use(cors({
    origin:true,
    optionsSuccessStatus: 200,
    credentials: true,
}));

app.use(cookieParser(config.cookie_secret))

//Server settings
//Reference: https://medium.com/geekculture/build-and-deploy-a-web-application-with-react-and-node-js-express-bce2c3cfec32
// Pick up React index.html file
 app.use(express.static(path.resolve(process.cwd(), 'client/build')));


//Request Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookie_secret))
const router = express.Router();
app.use(router);

routes(app, router)

//Catch all requests that don't match any route
app.get('*', (req, res) => {
   res.sendFile(
          path.resolve(process.cwd(), 'client/build/index.html')
   );
 });

module.exports = app;