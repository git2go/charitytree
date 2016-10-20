"use strict";

const Promise = require('bluebird')
const Organization = require('../models/organization')
const _ = require('lodash')
const errors = require('common-errors')
const fileService = require('../services/fileService')
const streamifier = require('streamifier');
const conn = require('../config/connections')

module.exports = {
    getInfo: function(req, res) {
        if (!req.params.id) {
            return res.status(400).json({ status: 400, message: ""})
        }

        return Organization.findOne({ _id: req.params.id })
        .select('-password -feed -profile_img.data')
        .populate('projects endorsements')
        .lean()
        .then(org => {
            if (!org) {
                return res.status(404).json({ status: 404, message: "Organization not found" });
            }

            return res.status(200).json({ status: 200, results: org });
        })
        .catch(res.serverError)
    },

    getProfileImg: function(req, res) {
        return Organization.findById(req.session.user.uid)
        .then(org => {
            if (!org) {
              return res.status(404).send({status: 404, message: "Organization not found"});
            }

            return streamifier.createReadStream(org.profile_img.data).pipe(res);
        })
        .catch(res.serverError)
    },

    updateProfile: function(req, res) {
        const { about, areas_of_focus } = req.body
        const options = { fields: 'name username about areas_of_focus', new: true }

        return Organization.findOneAndUpdate({ _id: req.session.user.uid }, { about, areas_of_focus }, options)
        .then(org => {
            if (!org) {
                return res.status(404).json({ status: 404, message: "User profile not found"})
            }

            return res.status(200).json({ status: 200, results: org });
        })
        .catch(res.serverError)
    },

    uploadProfileImg: function(req, res) {
        if (_.isEmpty(req.file)) return res.badRequest(new ArgumentNullError("file"))

        const valuesToUpdate = {
            profile_img: { data: req.file.buffer, contentType: req.file.mimetype, filename: req.file.originalname }
        }
        const options = { fields: 'profile_img', new: true }

        return Organization.findOneAndUpdate({ _id: req.session.user.uid }, valuesToUpdate, options)
        .then(({ profile_img: { contentType, filename }}) => {
            if (!profile_img) {
                throw new errors.NotFoundError("user")
            }
            // org.feed.push({
            //   user: org.name,
            //   message: 'changed profile image',
            //   attachment: `/organization/profile_img/${org._id}`,
            //   attachment_type: 'image',
            //   created_date: Date.now()
            // });
            return res.status(200).json({ status: 200, results: { contentType, filename } });
        })
        .catch(errors.NotFoundError, res.notFound)
        .catch(res.serverError)
    },

    uploadMedia: function(req, res) {
        if (_.isEmpty(req.files)) {
            return res.badRequest(new errors.ArgumentNullError("Missing argument(s)"))
        }

        return Promise.map(req.files, file => {
            return fileService.storeFileInGrid(file, req.session.user.uid)
        })
        .then(files => {
            return [ files, Organization.findById(req.session.user.uid).select('images videos feed') ]
        })
        .spread(files, org => {
            _.each(files, file => {
                const mimeType = _.slice(file.content_type, 0, 5)
                //store fileId in appropriate organization media property
                if (mimeType === 'image') {
                    org.images.push(file._id);
                } else if (mimeType === 'video') {
                    org.videos.push(file._id);
                }
                // org.feed.push({
                //   user: org.name,
                //   message: `uploaded a new ${mimeType}`,
                //   attachment: `/dashboard_data/org/media/${fileId}`,
                //   attachment_type: mimetype,
                //   created_date: new Date()
                // });
            })

            return org.save()
        })
        .then(({ images, videos }) => {
            return res.status(201).send({ status: 201, results: { images, videos } });
        })
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

    projects: function(req, res) {
        return Organization.findOne({ _id: req.session.user.uid })
        .select('projects -_id')
        .populate('projects')
        .lean()
        .then(projects => {
            if (!projects || !projects.length) {
                return res.notFound(new errors.NotFoundError("projects"))
            }

            return res.status(200).json({ status: 200, data: projects });
        })
        .catch(res.serverError)
    },

    dashboardData: function(req, res) {
        return Organization.findOne({ _id: req.session.user.uid })
        .select('-password -profile_img.data')
        .populate('projects endorsements')
        .lean()
        .then(org => {
            // org.feed = org.feed.filter(itfunctionem => {
            //     return item.user !== org.name;
            // })
            // .sort((item1, item2) => {
            //     return item2.created_date - item1.created_date;
            // });

            return res.status(200).json({ status: 200, data: org });
        })
        .catch(res.serverError)
    }
}
