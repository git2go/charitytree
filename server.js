const express = require('express');
require('./api/config/custom-responses')(express);

const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo/es5')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const routes = require('./api/routes');

const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')(server);
const events = require('./api/controllers/event')(socket)
const dbConn = require('./api/config/connections').mongoose

const PORT = process.env.PORT || 3000;
server.listen(PORT);

//================================= MIDDLEWARE ==================================/

//server static files
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

//parse cookies
app.use(cookieParser());

// session middleware
app.use(session({
    // name: 'server-session-cookie-id',
    secret: '@%20%23&amp;',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: dbConn }),
    cookie: { maxAge: 3600000 },
    rolling: true
}));

app.use('/auth', routes.auth)
app.use('/organization', routes.organization);
app.use('/donor', routes.donor)
app.use('/project', routes.project);
app.use('/search', routes.search);


// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('/', function (req, res) {
    return res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('*', function (req, res) {
    return res.sendFile(path.join(__dirname, '/public/index.html'));
});
