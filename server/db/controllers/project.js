var Project = require('../models/project.js');

module.exports = {
  retrieve: function(req, res, next, criteria, options, method) {
    var criteria = criteria || {}, method = method || '';
    var query = (Project[method]) ? Project[method](criteria) : Project.find(criteria);

    if (options) {
      for (var key in options) {
        if (query[key]) {
          query[key](options[key]);
        }
      }
    }
    query.exec(function(err, projects) {
      if (err) handleError(req, res, "Controller: Project, Method: Retrieve", err);
      res.send({ status: 200, results: projects });
    });
  },

  create: function(req, res, next, projectData) {
    Project.findOne({name: projectData.title}, function(err, found) {
      if (err) handleError(req, res, "Controller create", err);
      if (!found) {
        Project.create(projectData, function(err, project) {
          if (err) handleError(req, res, "Controller create", err);
          res.send({ status: 201, results: project });
        });
      } else {
          res.status(400).send({ status: 400, message: "We found an project with this name." });
      }
    });
  },

  update: function(req, res, next, criteria, changes, method, options) {
    Project.findOne(criteria, function(err, doc) {
      if (err) handleError(req, res, "Controller update", err);
      if (doc) {
        for (var key in changes) {
          if (doc[key]) {
            doc[key] = changes[key];
          }
        }
        doc.save(function(err, project) {
          res.send({ status: 201, results: project });
        });
      } else {
        res.status(400).send({ status: 400, message: "Project not found." });
      }
    });
  },

  delete: function(req, res, next, criteria, options, method) {
    var criteria = criteria || {}, method = method || '';
    var query = (Project[method]) ? Project[method](criteria) : Project.findOne(criteria);
    if (options) {
      for (var key in options) {
        if (query[key])
          query[key](options[key]);
      }
    }
    query.remove().exec(function(err, project) {
      if (err)
        handleError(req, res, "Controller: Donor, Method: Delete", err);
      else
        res.send({ status: 201, message: "Delete was successful" });
    });
  }
};

var handleError = function(req, res, source, err, message) {
  if (req.method === 'GET')
    res.status(400).send({ status: 400, message: message });
  if (req.method === 'POST')
    res.status(400).send({ status: 400, results: null, message: message });
};
