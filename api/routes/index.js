"use strict";

const auth = require('./auth');
const organization = require('./organization');
const donor = require('./donor');
const project = require('./project');
const search = require('./search');


const routes = {
  auth,
  organization,
  donor,
  project,
  search
}

module.exports = routes;
