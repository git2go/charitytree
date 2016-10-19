var express = require('express');
var router = express.Router();

var _db = require('../db/connection.js');
var Model = require('../db/models');
var multer = require('multer');
var streamifier = require('streamifier');

router.post('/profile', function(req, res, next) {
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

router.post('/project/create', function(req, res, next) {
  if (req.session && req.session.user) {
      var newProject = req.body.projectData;
      newProject._org = req.session.user.uid;
      res.status(201).send('Success');
  } else {
    res.status(401).send({ status: 401, message: "Unauthorized to access dashboard" });
  }
});

router.post('/profile_img/upload', multer().single('profile_img'), function(req, res, next) {
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

router.post('/org/media/upload', multer().array('media'), function(req, res, next) {
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

router.post('/project/media/upload', multer().array('media'), function(req, res, next) {
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

router.post('/project/update', function(req, res, next) {
  res.send('Success')
});

router.post('/project/needs/update', function(req, res, next) {
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

router.post('/donor/endorsement', function(req, res, next) {
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

var handleError = function(req, res, err, statusCode, msg) {
  console.error("Error: ", err);
  res.status(statusCode).send({status: statusCode, message: msg});
}

module.exports = router;
