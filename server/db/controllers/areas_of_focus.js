var AoF = require('../models/areas_of_focus.js');

module.exports = {
  retrieve: function(req, res, next, criteria, options, method) {
    var criteria = criteria || {}, method = method || '';
    var query = (AoF[method]) ? AoF[method](criteria) : AoF.find(criteria);

    if (options) {
      for (var key in options) {
        if (query[key]) {
          query[key](options[key]);
        }
      }
    }
    query.exec(function(err, aofs) {
      if (err) handleError(req, res, "Controller: AoF, Method: Retrieve", err);
      res.send({ status: 200, results: aofs });
    });
  },

  create: function(req, res, next, aofData) {
    AoF.findOne({name: aofData.name}, function(err, found) {
      if (err) handleError(req, res, "Controller create", err);
      if (!found) {
        AoF.create(aofData, function(err, aof) {
          if (err) handleError(req, res, "Controller create", err);
          res.send({ status: 201, results: aof });
        });
      } else {
          res.status(400).send({ status: 400, message: "We found an area of focus with this name." });
      }
    });
  },

  update: function(req, res, next, criteria, changes, method, options) {
    AoF.findOne(criteria, function(err, doc) {
      if (err) handleError(req, res, "Controller update", err);
      if (doc) {
        for (var key in changes) {
          if (doc[key]) {
            doc[key] = changes[key];
          }
        }
        doc.save(function(err, aof) {
          res.send({ status: 201, results: aof });
        });
      } else {
        res.status(400).send({ status: 400, message: "Area of Focus not found." });
      }
    });
  },

  delete: function(req, res, next, criteria, options, method) {
    var criteria = criteria || {}, method = method || '';
    var query = (AoF[method]) ? AoF[method](criteria) : AoF.findOne(criteria);
    if (options) {
      for (var key in options) {
        if (query[key])
          query[key](options[key]);
      }
    }
    query.remove().exec(function(err, aof) {
      if (err)
        handleError(req, res, "Controller: AoF, Method: Delete", err);
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
