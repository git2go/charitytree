var organization = require('./organization.js');
var donor = require('./donor.js');
var project = require('./project.js');
var aof = require('./areas_of_focus.js');

module.exports = {
  Organization: organization,
  Donor: donor,
  Project: project,
  AoF: aof,
};
