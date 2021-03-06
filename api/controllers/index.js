"use strict";

const auth = require('./auth')
const organization = require('./organization')
const donor = require('./donor')
const project = require('./project')
const event = require('./event')


module.exports = {
    Auth: auth,
    Organization: organization,
    Donor: donor,
    Project: project,
    Event: event
};
