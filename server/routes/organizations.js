var express = require('express');
var router = express.Router();

var Model = require('../db/models');
var streamifier = require('streamifier');

router.get('/:id', function(req, res, next) {
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

router.get('/profile_img/:id', function(req, res, next) {
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

router.post('/follow/:id', function(req, res, next) {
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

var handleError = function(req, res, err, statusCode, msg) {
  console.error("Error: ", err);
  res.status(statusCode).send({status: statusCode, message: msg});
}

module.exports = router;
