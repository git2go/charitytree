var express = require('express');
var router = express.Router();

var _db = require('../db/connection.js');
var Model = require('../db/models');
var streamifier = require('streamifier');

router.get('/', function(req, res, next) {
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

router.get('/org/media/:id', function(req, res, next) {
  if (req.params.id !== 'undefined') {
    var readstream = _db.gridfs.createReadStream({ _id: req.params.id });
    readstream.pipe(res);
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});

router.get('/projects', function(req, res, next) {
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

router.get('/project/media/:id', function(req, res, next) {
  if (req.params.id !== 'undefined') {
    var readstream = _db.gridfs.createReadStream({ _id: req.params.id });
    readstream.pipe(res);
  } else {
    res.status(404).send({status: 404, message: "Resource not found"});
  }
});

router.get('/profile_img/:user/:filename', function(req, res, next) {
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

var handleError = function(req, res, err, statusCode, msg) {
  console.error("Error: ", err);
  res.status(statusCode).send({status: statusCode, message: msg});
}

module.exports = router;
