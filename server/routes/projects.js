var express = require('express');
var router = express.Router();

var Model = require('../db/models');

router.get('/:id', function(req, res, next) {
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

var handleError = function(req, res, err, statusCode, msg) {
  console.error("Error: ", err);
  res.status(statusCode).send({status: statusCode, message: msg});
}

module.exports = router;
