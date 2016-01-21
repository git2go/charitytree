var PORT = process.env.PORT || 4000;

var express = require('express');
var path = require('path');

var _db = require('./db/connection.js');
var Model = require('./db/models');

var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var bcrypt = require('bcrypt-nodejs');

var routes = require('./routes/index.js');


var app = express();
var server = require('http').Server(app);
var feed = require('./socket.io.js')(server);

server.listen(PORT);

//================================= MIDDLEWARE ==================================/

//server static files
app.use(express.static(path.join(__dirname, '../client')));

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
  store: new MongoStore({
    mongooseConnection: _db.connection
  }),
  cookie: { maxAge: 3600000 },
  rolling: true
}));

app.use('/dashboard', routes.dashboard);
app.use('/dashboard_data', routes.dashboard_data);
app.use('/organization', routes.organizations);
app.use('/project', routes.projects);

// var util = require('util');
// var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
// var log_stdout = process.stdout;
//   log_file.write(util.format(d) + '\n');
//   log_stdout.write(util.format(d) + '\n');
// };

app.post('/signup_post', function(req, res, next) {
  //check if username already exists
  Model.Organization.findOne({username: req.body.username}, function(err, found) {
    if (err) { handleError(req, res, err, 500, "Could not complete signup operation."); }
    if (found) {//username was found in organization collection
      res.status(401).send({ status: 401, message: "Username is already taken." });
    } else {
      Model.Donor.findOne({username: req.body.username}, function(err, found) {
        if (err) { handleError(req, res, err, 500, "Could not complete signup operation."); }
        if (found) {//username was found in donor collection
          res.status(401).send({ status: 401, message: "Username is already taken." });
        } else {//username was found in either organization or donor collection
          bcrypt.hash(req.body.pwd, null, null, function(err, hash) {//hash password
            if (err) { handleError(req, res, err, 500, "Could not complete signup operation."); }
            if (req.body.userType === 'Organization') {
              var orgData = {
                name: req.body.org_name,
                username: req.body.username,
                password: hash
              };
              Model.Organization.create(orgData, function(err, org) {
                if (err) { handleError(req, res, err, 500, "Could not complete signup operation."); }
                req.session.user = { uid: org._id, type: 'organization' };
                org.feed.push({
                  user: 'Charity Collective',
                  message: 'Welcome to Charity Tree',
                  created_date: new Date()
                });
                org.save(function() {
                  res.send({ status: 201, token: req.session.user.uid });
                });
              });
            } else if (req.body.userType === 'Donor') {
              var donorData = {
                name: { first: req.body.first_name, last: req.body.last_name },
                email: req.body.email,
                username: req.body.username,
                password: hash
              };
              Model.Donor.create(donorData, function(err, donor) {
                if (err) { handleError(req, res, err, 500, "Could not complete signup operation."); }
                else {
                  req.session.user = { uid: donor._id, type: 'donor' };
                  donor.push({
                    user: 'Charity Collective',
                    message: 'Welcome to Charity Tree',
                    created_date: new Date()
                  });
                  donor.save(function() {
                    res.send({ status: 201, token: req.session.user.uid });
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.post('/login_post', function(req, res, next) {
  //check if user is a donor
  Model.Donor.findOne({ username: req.body.username }, function(err, donor) {
    if (err) { handleError(req, res, err, 500, "Login Error."); }
    if (donor) { //is user a donor
      bcrypt.compare(req.body.pwd, donor.password, function(err, result) {
        if (err) { handleError(req, res, err, 500, "Login validation failed."); }
        else {
          if (result) {
            //create session
            req.session.user = { uid: donor._id, type: 'donor' };
            res.status(201).send({ status: 201, token: req.session.user.uid });
          } else { //found donor but password doesn't match
            res.status(401).send({ status: 401, message: "Invalid username/password combination" });
          }
        }
      });
    } else {
      //check if user is an organization
      Model.Organization.findOne({ username: req.body.username }, function(err, org) {
        if (err) { handleError(req, res, err, 500, "Login Error."); }
        if (org) { //is user an organization
          bcrypt.compare(req.body.pwd, org.password, function(err, result) {
            if (err) { handleError(req, res, err, 500, "Login validation failed."); }
            if (result) {
              //create session
              req.session.user = { uid: org._id, type: 'organization' };
              res.send({ status: 201, token: req.session.user.uid });
            } else { //found org but password doesn't match
              res.status(401).send({ status: 401, message: "Invalid username/password combination" });
            }
          });
        } else { //did not find user in either donor or organization collection
          res.status(401).send({ status: 401, message: "Invalid username/password combination" });
        }
      });
    }
  });
});

app.post('/logout_post', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
    res.status(201).send({status: 201, message: 'User has been logged out'});
  });
});

app.post('/search', function(req, res, next) {
  var aofs = req.body.aofs.map(function (aof) {
    return new RegExp('\\b' + aof.toLowerCase() + '\\b', 'i');
  });
  Model.Organization.find({ $or:
      [{ areas_of_focus: {$all: aofs} }, { name: {$in: aofs} }, { username: {$in: aofs} }]
    }).select('-password -feed -profile_img.data')
    .lean()
    .exec(function (err, orgs) {
      if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
      else {
        Model.Project.find({ $or:
            [{ areas_of_focus: {$all: aofs} }, { title: {$in: aofs} }]
          })
          .lean()
          .exec(function (err, projects) {
          if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
          else {
            res.status(201).send({ status: 201, results: {orgs: orgs, projects: projects} });
          }
        });
      }
  });
});

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (req, res, next){
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

var handleError = function(req, res, err, statusCode, msg) {
  console.error("Error: ", err);
  res.status(statusCode).send({status: statusCode, message: msg});
}
