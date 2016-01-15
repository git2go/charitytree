var express = require('express');

var _db = require('./db/connection.js');
var Controller = require('./db/controllers');
var Model = require('./db/models');

var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');

var path = require('path');
var fs = require('fs');
var streamifier = require('streamifier');
var bcrypt = require('bcrypt-nodejs');

var IP = '127.0.0.1', PORT = 4000;

var app = express();
var server = require('http').Server(app);
// var io = require('socket.io')(server);
var feed = require('./socket.io.js')(server);

server.listen(PORT, IP);

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
  cookie: { maxAge: 3600000 }
}));

// app.use(function(req, res, next) {
//   // if now() is after `req.session.cookie.expires`
//   var now = new Date();
//   if (now > req.session.cookie.expires) {
//     //regenerate the session
//     req.session.regenerate(function(err) {
//     });
//   }
//   next();
// });

// var util = require('util');
// var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
// var log_stdout = process.stdout;
//   log_file.write(util.format(d) + '\n');
//   log_stdout.write(util.format(d) + '\n');
// };

//================================== GET ====================================//
app.get('/dashboard_data', function(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.type === 'organization') {
      Model.Organization.findOne({_id: req.session.user.uid})
        .select('-password -profile_img.data')
        .populate('projects endorsements')
        .lean()
        .exec(function(err, org) {
          if (err) { handleError(req, res, err, 500, 'Could not complete operation.'); }
          else {
            org['feed'] = org.feed.filter(function(item) {
              return item.user !== org.name;
            }).sort(function(item1, item2) {
              return new Date(item2.created_date) - new Date(item1.created_date);
            });
            res.status(200).send({status: 200, results: org, userType: req.session.user.type });
          }
        });
    } else if (req.session.user.type === 'donor') {
      Model.Donor.findOne({ _id: req.session.user.uid }).select('-password')
        .populate('sponsored_projects following endorsements')
        .lean()
        .exec(function(err, donor) {
        if (err) { handleError(req, res, err, 500, 'Could not complete operation.'); }
        else {
          donor['feed'] = donor.feed.filter(function(item) {
            return item.user !== donor.name.first + " " + donor.name.last;
          }).sort(function(item1, item2) {
            return new Date(item2.created_date) - new Date(item1.created_date);
          });

          var keys = ['feed', 'images', 'password', 'videos', 'areas_of_focus'];
          donor.following.forEach(function(obj) {
            keys.forEach(function(key) {
              delete obj[key];
            });
          });
          res.send({ status: 200, results: donor, userType: req.session.user.type });
        }
      });
    }
  } else {
    res.status(401).send({ status: 401, message: "Unauthorized to access dashboard" });
  }
});

app.get('/dashboard_data/projects', function(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.type === 'organization') {
      Model.Organization.findOne({ _id: req.session.user.uid })
      .select('projects -_id')
      .populate('projects')
      .lean()
      .exec(function(err, projects) {
        if (err) handleError(req, res, err, 500, 'Could not complete operation.');
        else { res.status(200).send({ status: 200, results: projects }); }
      });
    }
  } else {
    res.status(401).send({ status: 401, message: "Unauthorized to access dashboard" });
  }
});

app.get('/dashboard_data/org/media/:id', function(req, res, next) {
  //req.params.id is the fileId of file stored in gridfs
  if (req.params.id !== 'undefined') {
    var readstream = _db.gridfs.createReadStream({ _id: req.params.id });
    readstream.pipe(res);
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});

app.get('/dashboard_data/project/media/:id', function(req, res, next) {
  if (req.params.id !== 'undefined') {
    var readstream = _db.gridfs.createReadStream({ _id: req.params.id });
    readstream.pipe(res);
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});

app.get('/organization_get/:id', function(req, res, next) {
 if (req.params.id !== 'undefined') {
   Model.Organization.findOne({ _id: req.params.id })
    .select('-password -feed -profile_img.data')
    .populate('projects endorsements')
    .lean()
    .exec(function(err, org) {
     if (err) handleError(req, res, err, 500, 'Could not complete operation.');
     else {
       res.status(200).send({status: 200, results: org });
     }
   });
 } else {
   res.status(404).send({status: 404, message: "Resource not found" });
 }
});

app.get('/organization/profile_img/:id', function(req, res, next) {
  if (req.params.id !== 'undefined') {
    Model.Organization.findById(req.params.id, function (err, org) {
      if (err) handleError(req, res, err, 500, 'Could not complete operation.');
      else {
        if (org) {
          streamifier.createReadStream(org.profile_img.data).pipe(res);
        } else {
          res.status(404).send({status: 404, message: "Resource not found"});
        }
      }
    });
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});

app.get('/project_get/:id', function(req, res, next) {
  if (req.params.id !== 'undefined') {
    Model.Project.findOne({ _id: req.params.id })
     .populate('_org').lean()
     .exec(function(err, project) {
      if (err) {
        handleError(req, res, err, 500, 'Could not complete operation.');
      }
      else {
        if (project) {
          if (project['_org']) {
            var keys = ['feed', 'password', 'followers', 'profile_img'];
            keys.forEach(function(key) {
                if (key in project['_org'])
                  delete project['_org'][key];
             });
          }
          res.status(200).send({status: 200, results: project });
        } else {
          res.status(404).send({status: 404, message: 'Resource not found' });
        }
      }
    });
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});

app.get('/dashboard_data/profile_img/:user/:filename', function(req, res, next) {
  if (req.params.user !== 'undefined' && req.params.filename !== 'undefined') {
    Model.Organization.findOne({ username: req.params.user }, function(err, org) {
      if (err) { console.error(err); res.status(400).send('Could not retrieve data'); }
      else {
        streamifier.createReadStream(org.profile_img.data).pipe(res);
      }
    });
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});
//================================== POST ===================================//
app.post('/signup_post', function(req, res, next) {
  //check if username already exists
  Model.Organization.findOne({username: req.body.username}, function(err, found) {
    if (err) {
      console.error("Signup Error:", err);
      res.status(500).send({ status: 500, message: "Could not complete signup operation." });
    }
    if (found) {//username was found in organization collection
      res.status(401).send({ status: 401, message: "Username is already taken." });
    } else {
      Model.Donor.findOne({username: req.body.username}, function(err, found) {
        if (err) {
          console.error("Signup Error:", err);
          res.status(500).send({ status: 500, message: "Could not complete signup operation." });
        }
        if (found) {//username was found in donor collection
          res.status(401).send({ status: 401, message: "Username is already taken." });
        } else {//username was found in either organization or donor collection
          bcrypt.hash(req.body.pwd, null, null, function(err, hash) {//hash password
            if (err) {
              console.error("Signup Error:", err);
              res.status(500).send({ status: 500, message: "Could not complete signup operation." });
            }
            if (req.body.userType === 'Organization') {
              var orgData = {
                name: req.body.org_name,
                username: req.body.username,
                password: hash
              };
              Model.Organization.create(orgData, function(err, org) {
                if (err) {
                  console.error("Signup Error:", err);
                  res.status(500).send({ status: 500, message: "Could not complete signup operation." });
                }
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
                if (err) {
                  console.error("Signup Error:", err);
                  res.status(500).send({ status: 500, message: "Could not complete signup operation." });
                } else {
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
    if (err) {
      console.error("Login Error:", err);
      res.status(500).send({ status: 500, message: "Login Error." });
    }
    if (donor) { //is user a donor
      bcrypt.compare(req.body.pwd, donor.password, function(err, result) {
        if (err) {
          console.error("Login Error:", err);
          res.status(500).send({ status: 500, message: "Login validation failed." });
        } else {
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
        if (err) {
          console.error("Login Error:", err);
          res.status(500).send({ status: 500, message: "Login Error." });
        }
        if (org) { //is user an organization
          bcrypt.compare(req.body.pwd, org.password, function(err, result) {
            if (err) {
              console.error("Login Error:", err);
              res.status(500).send({ status: 500, message: "Login validation failed." });
            }
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
    if (err) {
      console.error("err",err);
    }
    res.status(201).send({status: 201, message: 'User has been logged out'});
  });
});

app.post('/organization/follow/:id', function(req, res, next) {
  var now = new Date();
  if (req.session && req.session.user && req.params.id) {
    Model.Organization.findById(req.params.id, function(err, org) {
      if (err) { console.error(err); }
      if (org) {
        Model.Donor.findById(req.session.user.uid, function(err, donor) {
          if (err) { console.error(err); }
          if (donor) {
            org.followers.push(donor);
            org.feed.push({
              user: donor.name.first + " " + donor.name.last,
              message: "started following you",
              created_date: now
            });
            org.save(function(err) {
              if (err) { console.error(err); }
              donor.following.push(org);
              donor.feed.push({
                user: donor.name.first + " " + donor.name.last,
                message: 'started following ' + org.name,
                created_date: now
              });
              donor.save(function() {
                res.status(201).send({status: 201, message: 'Success'});
              });
            });
          }
        });
      }
    });
  } else {
    res.status(401).send({status: 401, message: 'Please log in'});
  }
});

app.post('/dashboard/profile', function(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.type === 'organization') {
      Model.Organization.findById(req.session.user.uid)
        .select('name username about areas_of_focus')
        .exec(function(err, org) {
        if (err) throw err;
        if (org) {
          org.about = req.body.about;
          org.areas_of_focus = req.body.areas_of_focus;
          org.save(function(err, updatedOrg) {
            if (err) throw err;
            else {
              res.status(201).send({ status: 201, results: updatedOrg });
            }
          });
        }
      });
    } else if (req.session.user.type === 'donor') {
      Model.Donor.findById(req.session.user.uid, 'name username email areas_of_focus', function(err, donor) {
        if (err) throw err;
        if (donor) {
          donor.name = req.body.name;
          donor.email = req.body.email;
          donor.areas_of_focus = req.body.areas_of_focus;
          donor.save(function(err, updatedDonor) {
            if (err) throw err;
            else { res.status(201).send({ status: 201, results: updatedDonor }); }
          });
        }
      });
    }
  } else {
    res.status(401).send({ status: 401, message: "Unauthorized to access dashboard" });
  }
});

app.post('/dashboard/project/create', function(req, res, next) {
  if (req.session && req.session.user) {
      var newProject = req.body.projectData;
      newProject._org = req.session.user.uid;
      res.status(201).send('Success');
  } else {
    res.status(401).send({ status: 401, message: "Unauthorized to access dashboard" });
  }
});

app.post('/dashboard/profile_img/upload', multer().single('profile_img'), function(req, res, next) {
  Model.Organization.findById({ _id: req.session.user.uid }, function(err, org) {
    if (err) { console.error(err); res.status(400).send('Could not retrieve data'); }
    else {
      org.profile_img.data = req.file.buffer;
      org.profile_img.contentType = req.file.mimetype;
      org.profile_img.filename = req.file.originalname;
      org.feed.push({
        user: org.name,
        message: 'changed profile image',
        attachment: '/organization/profile_img/'+ org._id,
        attachment_type: 'image',
        created_date: new Date()
      });
      org.save(function(err, currOrg) {
        if (err) { console.error("Profile Image save error: ", err); }
        res.status(201).send({ status: 201, results: {
          contentType: currOrg.profile_img.contentType,
          filename: currOrg.profile_img.filename }
        });
      });
    }
  });
});

app.post('/dashboard/org/media/upload', multer().array('media'), function(req, res, next) {
  req.files.forEach(function(file) {
    //generate an object id
    var fileId = _db.types.ObjectId();
    var writeStream = _db.gridfs.createWriteStream({
      _id: fileId,
      length: Number(file.size),
      chunkSize: 1024 * 4,
      filename: file.originalname,
      content_type: file.mimetype,
      mode: 'w',
      metadata: {
        org: req.session.user.uid
      }
    });

    streamifier.createReadStream(file.buffer).pipe(writeStream);
    writeStream.on('close', function() {
      //store fileId in media property of organization
      Model.Organization.findById({ _id: req.session.user.uid })
       .select('images videos feed')
       .exec(function(err, org) {
        if (err) { throw err; }
        else {
          if (file.mimetype.slice(0, 6) === 'image/') { org.images.push(fileId); }
          else if (file.mimetype.slice(0, 6) === 'video/') { org.videos.push(fileId); }
          org.feed.push({
            user: org.name,
            message: 'uploaded a new ' + file.mimetype.slice(0, 5),
            attachment: '/dashboard_data/org/media/'+ fileId,
            attachment_type: file.mimetype.slice(0, 5),
            created_date: new Date()
          });
          org.save(function(err, updatedOrg) {
            if (err) { throw err; }
            else {
              res.status(201).send({ status: 201,
                results: {images: updatedOrg.images, videos: updatedOrg.videos}});
            }
          });
        }
      });
    });
  });
});

app.post('/dashboard/project/media/upload', multer().array('media'), function(req, res, next) {
  req.files.forEach(function(file) {
    //generate an object id
    var fileId = _db.types.ObjectId();
    var writeStream = _db.gridfs.createWriteStream({
      _id: fileId,
      length: Number(file.size),
      chunkSize: 1024 * 4,
      filename: file.originalname,
      content_type: file.mimetype,
      mode: 'w',
      metadata: {
        org: req.session.user.uid
      }
    });

    streamifier.createReadStream(file.buffer).pipe(writeStream);
    writeStream.on('close', function() {
      //store fileId in images/videos property of project
      Model.Project.findById({ _id: req.body.project }, function(err, project) {
        if (err) { throw err; }
        else {
          if (file.mimetype.slice(0, 6) === 'image/') { project.images.push(fileId); }
          else if (file.mimetype.slice(0, 6) === 'video/') { project.videos.push(fileId); }
          project.save(function(err, updatedProject) {
            if (err) { throw err; }
            else {
              Model.Organization.findById(project._org || req.session.user.uid, function(err, org) {
                if (err) throw err;
                if (org) {
                  org.feed.push({
                    user: org.name,
                    message: 'uploaded a new '+ file.mimetype.slice(0, 5) + ' for project: ' + project.title,
                    attachment: 'dashboard_data/project/media/'+ fileId,
                    attachment_type: file.mimetype.slice(0, 5),
                    created_date: new Date()
                  });
                }
              });
              res.status(201).send({ status: 201, message: "Media upload successful." });
            }
          });
        }
      });
    });
  });
});

app.post('/post_search', function(req, res, next) {
  var aofs = req.body.aofs.map(function (aof) {
    return new RegExp('\\b' + aof.toLowerCase() + '\\b', 'i');
  });
  Model.Organization.find({ $or: [
    { areas_of_focus: {$all: aofs} },
    { name: {$in: aofs} },
    { username: {$in: aofs} }
    ]}).select('-password -feed -profile_img.data')
    .lean()
    .exec(function (err, orgs) {
      if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
      else {
        Model.Project.find({ $or: [
          { areas_of_focus: {$all: aofs} },
          { title: {$in: aofs} }
          ]})
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

app.post('/dashboard/project/update', function(req, res, next) {
  res.send('Success')
});

app.post('/dashboard/project/needs/update', function(req, res, next) {
  Model.Project.findById(req.body._id, function(err, project) {
    if (err) console.error(err);
    if (project) {
      project.amount.current = req.body.amount.current;
      req.body.needs_list.forEach(function(need) {
        var pn = project.needs_list.id(need._id);
        pn.quantity_needed = need.quantity_needed;
        pn.number_participants = (pn.number_participants == null) ? 1 : pn.number_participants++;
      });
      project.total_donors_participating = (project.total_donors_participating == null)
        ? 1
        : project.total_donors_participating++;
      project.save(function(err, updatedProject) {
        if (err) throw err;
        res.status(201).send({status: 201, data: updatedProject });
      });
    } else {
      res.status(400).send({status: 400, message: 'Could not complete request'});
    }
  });
});

app.post('/dashboard/donor/endorsement', function(req, res, next) {
  Model.Endorsement.findOne({title: req.body.title}, function(err, found) {
    if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
    if (!found) {
      Model.Endorsement.create(req.body, function(err, endorsement) {
        if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
        if (endorsement) {
          Model.Organization.findById(endorsement.org, function(err, org) {
            if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
            if (org) {
              org.endorsements.push(endorsement);
              org.save(function(err) {
                if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
                Model.Donor.findById(endorsement.author, function(err, donor) {
                  if (err) { handleError(req, res, err, 500, 'Could not complete operation'); }
                  if (donor) {
                    donor.endorsements.push(endorsement);
                    donor.save(function(err, updatedDonor) {
                      res.status(201).send({status: 201, results: updatedDonor});
                    });
                  }
                });
              });
            }
          });
        }
      });
    } else {
      res.status(400).send({status: 400, message: 'Endorsement already exists'});
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
