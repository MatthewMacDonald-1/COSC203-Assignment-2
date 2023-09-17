const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');

/* create the server */
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app.use(bodyParser.raw());
app.use(bodyParser.json());

/* host public/ directory to serve: images, css, js, etc. */
app.use(express.static('public'));

/* path routing and endpoints */
app.use('/', require('./path_router'));

app.options('*', (request, response) => {
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
	response.header('Access-Control-Allow-Headers', 'Content-Type');
	response.send();
})

/* start the server */
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});