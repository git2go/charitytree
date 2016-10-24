"use strict";

const Promise = require('bluebird')
const Donor = require('../models/donor')
const Organization = require('../models/organization')
const Endorsement = require('../models/endorsement')
const errors = require('common-errors')


module.exports = {
    updateProfile: function(req, res) {
        const { name, email, areas_of_focus } = req.body
        const options = { fields: 'name username email areas_of_focus', new: true }

        return Donor.findOneAndUpdate({ _id: req.session.user.uid }, { name, email, areas_of_focus }, options)
        .then(donor => {
            if (!donor) {
                return res.notFound(new errors.NotFoundError("user"));
            }

            return res.ok(201, { data: donor });
        })
        .catch(res.serverError)
    },

    follow: function(req, res) {
        const now = Date.now();

        if (!req.params.orgId) {
            return res.badRequest(new errors.ArgumentNullError("org id"));
        }

        return Promise.all([ Donor.findById(req.session.user.uid), Organization.findById(req.params.orgId) ])
        .spread((donor, org) => {
            if (!donor) throw new errors.NotFoundError("user")
            if (!org) throw new errors.NotFoundError("organization")

            org.followers.push(donor);
            org.feed.push({ user: donor.username, message: "started following you", created_date: now });
            donor.following.push(org);
            donor.feed.push({ user: "You", message: `started following ${org.name}`, created_date: now });

            return [ org.save(), donor.save() ]
        })
        .then(() => {
            return res.ok(201, { message: 'Success' });
        })
        .catch(errors.NotFoundError, res.notFound)
        .catch(res.serverError)
    },

    endorse: function (req, res) {
        if (!req.params.orgId) return res.badRequest(new ArgumentNullError("org id"));
        if (!req.body.title) return res.badRequest(new ArgumentNullError("title"));
        if (!req.body.review) return res.badRequest(new ArgumentNullError("review"));

        return Promise.all([ Organization.findById(req.params.orgId), Donor.findById(req.session.user.uid) ])
        .spread((org, donor) => {
            if (!org) throw new errors.NotFoundError("organization")
            if (!donor) throw new errors.NotFoundError("user")

            return Endorsement.findOne({ org: req.params.orgId, author: req.session.user.uid })
        })
        .then(found => {
            if (found) throw new errors.AlreadyInUseError("Endorsement already exists");

            const values = {
                org: req.params.orgId,
                author: req.session.user.uid,
                title: req.body.title,
                review: req.body.review
            }

            return Endorsement.create(values);
        })
        .then(endorsement => {
            org.endorsements.push(endorsement._id);
            donor.endorsements.push(endorsement._id);

            return [ endorsement, org.save(), donor.save() ];
        })
        .then(_.first)
        .then(endorsement => {
            return res.ok(201, { data: endorsement });
        })
        .catch(errors.AlreadyInUseError, res.badRequest)
        .catch(errors.NotFoundError, res.notFound)
        .catch(res.serverError)
    },

    dashboardData: function (req, res) {
        return Donor.findOne({ _id: req.session.user.uid }).select('-password')
        .populate({ path: 'following', select: '-feed -images -password -videos -areas_of_focus' })
        .populate('sponsored_projects')
        .populate('endorsements')
        .lean()
        .then(donor => {
            if (!donor) {
                return res.notFound(new errors.NotFoundError("donor"))
            }
            //   donor['feed'] = donor.feed.filter(function(item) {
            //     return item.user !== donor.name.first + " " + donor.name.last;
            //   }).sort(function(item1, item2) {
            //     return new Date(item2.created_date) - new Date(item1.created_date);
            //   });
            return res.ok({ data: donor });
        });
    }
}
