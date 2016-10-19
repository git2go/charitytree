var Donor = require('../models/donor.js');

module.exports = {
  retrieve: function(req, res, next, criteria, callback, options, method) {
    var criteria = criteria || {}, method = method || '';
    var query = (Donor[method]) ? Donor[method](criteria) : Donor.find(criteria);

    if (options) {
      for (var key in options) {
        if (query[key]) {
          query[key](options[key]);
        }
      }
    }
    query.exec(callback);
  },

  create: function(req, res, next, donorData) {
    Donor.findOne({name: donorData.name}, function(err, found) {
      if (err) handleError(req, res, "Controller create", err);
      if (!found) {
        Donor.create(donorData, function(err, donor) {
          if (err) handleError(req, res, "Controller create", err);
          else {
            req.session.uid = donor._id;
            res.send({ status: 201, results: donor });
          }
        });
      } else {
        res.status(400).send({ status: 400, message: "We found an donor with this name." });
      }
    });
  },

  update: function(req, res, next, criteria, changes, options) {
    Donor.findOne(criteria, options, function(err, doc) {
      if (err) handleError(req, res, "Controller update", err);
      if (doc) {
        for (var key in changes) {
          if (key in doc)
            doc[key] = changes[key];
        }
        doc.save(function(err, donor) {
          res.status(201).send({ status: 201, results: donor });
        });
      } else {
        res.status(400).send({ status: 400, message: "Donor not found." });
      }
    });
  },

  delete: function(req, res, next, criteria, options, method) {
    var criteria = criteria || {}, method = method || '';
    var query = (Donor[method]) ? Donor[method](criteria) : Donor.findOne(criteria);
    if (options) {
      for (var key in options) {
        if (query[key])
          query[key](options[key]);
      }
    }
    query.remove().exec(function(err, donor) {
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
