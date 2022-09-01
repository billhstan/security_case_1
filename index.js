//index.js
const app = require('./app');
const PORT = process.env.PORT || 8082; 

app.listen(PORT, err => {
    if (err) return console.log(`Cannot Listen on PORT: ${PORT}`);
    console.log(`Server is Listening on: http://localhost:${PORT}/`);
});

