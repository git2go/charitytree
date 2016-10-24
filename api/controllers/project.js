"use strict";

const Project = require('../models/project');
const fileService = require('../services/fileService')
const _ = require('lodash')
const conn = require('../config/connections')

module.exports = {
    create: function(req, res) {
        const requiredFields = ['title', 'info', 'areas_of_focus']
        const newProject = _.reduce(_.pickSchema(Project, ['createdAt', 'updatedAt']), (obj, prop) => {
            return _.has(req.body, prop) ? _.set(obj, prop, _.at(req.body, prop)[0]) : obj
        }, {})

        newProject._org = req.session.user.uid;

        return Project.create(newProject)
        .then(project => {
            return res.ok(201, { data: project });
        })
        .catch(res.serverError)
    },

    uploadMedia: function(req, res) {
        if (!req.params.id) return res.badRequest(new ArgumentNullError("project id"));

        return Promise.map(req.files, file => {
            return fileService.storeFileInGrid(file, req.session.user.uid)
        })
        .then(files => {
            return [ files, Project.findById(req.params.id), Organization.findById(req.session.user.uid) ]
        })
        .spread((project, org) => {
            if (!project) throw new errors.NotFoundError("project")
            if (!org) throw new errors.NotFoundError("organization")

            _.each(files, file => {
                const mimeType = _.slice(file.content_type, 0, 5)
                if (mimeType !== 'image' && mimeType !== 'video') return;
                //store fileId for appropriate project media property
                if (mimeType === 'image') {
                    project.images.push(file._id);
                } else if (mimeType === 'video') {
                    project.videos.push(file._id);
                }

                org.feed.push({
                    user: org.name,
                    message: `uploaded a new ${mimetype} for project: ${project.title}`,
                    attachment: `dashboard_data/project/media/${file._id}`,
                    attachment_type: mimeType,
                    created_date: Date.now()
                });
            })

            return [ project.save(), org.save() ]
        })
        .spread((project, org) => {
            return res.ok(201, { data: project });
        })
        .catch(errors.NotFoundError, res.notFound)
        .catch(res.serverError)
    },

    getMedia: function(req, res) {
        if (!req.params.id) {
            return res.badRequest(new errors.ArgumentNullError("file id"))
        }

        return fileService.findFileInGrid({ _id: req.params.id })
        .then(found => {
            if (!found) {
                return res.notFound(new errors.NotFoundError("file"))
            }

            const readstream = conn.gridfs.createReadStream({ _id: req.params.id });
            return readstream.pipe(res);
        })
        .catch(res.serverError)
    },

    updateNeeds: function(req, res) {
        if (!req.params.id) return res.badRequest(new ArgumentNullError("project id"));
        if (!req.body.needs_list) return res.badRequest(new ArgumentNullError("needs"));

        return Project.findById(req.params.id)
        .then(project => {
            if (!project) throw new errors.NotFoundError("project")

            project.amount.current = req.body.amount.current;

            _.each(req.body.needs_list, need => {
                const pn = project.needs_list.id(need._id);

                pn.quantity_needed = need.quantity_needed;
                //update number of participants satisfying this need
                pn.number_participants = (pn.number_participants) ? 1 : ++pn.number_participants;
                //increment the number of participants in the project
                project.total_donors_participating = ++project.total_donors_participating;
            });

            return project.save();
        })
        .then(project => {
            res.ok(201, { data: project });
        })
        .catch(errors.NotFoundError, res.notFound)
        .catch(res.serverError)
    }
}
