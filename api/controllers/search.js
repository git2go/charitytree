"use strict";

const Promise = require('bluebird')
const errors = require('common-errors')
const _ = require('lodash')
const Organization = require('../models/organization')
const Project = require('../models/project')

module.exports = {
    locate: function(req, res) {
        if (!req.body.aofs || !req.body.aofs.length) {
            return res.badRequest(new ArgumentNullError("search terms"))
        }

        const aofs = _.map(req.body.aofs, aof => {
            return new RegExp('\\b' + aof.toLowerCase() + '\\b', 'i');
        });

        return Promise.props({
            organizations: Organization.find({
                $or: [
                    { areas_of_focus: { $all: aofs} },
                    { name: {$in: aofs} },
                    { username: {$in: aofs} }
                ]
            }).select('-password -feed -profile_img.data').lean(),

            projects: Project.find({
                $or: [
                    { areas_of_focus: {$all: aofs} },
                    { title: {$in: aofs} }
                ]
            }).lean()
        })
        .then(data => {
            res.ok({ data });
        })
        .catch(res.serverError)
    }
}
