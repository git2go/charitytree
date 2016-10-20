"use strict";

const Promise = require('bluebird')
const Organization = require('../models/organization')
const Donor = require('../models/donor')

module.exports.getFeed = function() {}

module.exports.getFeedUpdates = Promise.method(function(client, timestamp) {
    if (client.type === 'organization') {
        return Organization.findById(client.id)
        .populate({
            path: 'feed',
            match: { createdAt: { $gte: timestamp },
            user: { $ne: client.id } }
        })
        .then(org => {
            if (!org) return []

            return org.feed
        });
    }

    if (client.type === 'donor') {
        return Donor
        .findOne({ _id: client.id })
        .populate({
            path: 'following',
            model: 'Organization',
            populate: {
                path: 'feed',
                model: 'Event',
                match: { createdAt: { $gte: timestamp } },
                select: '-_id'
            }
        })
        .then(donor => {
            if (!donor) return []

            return donor.following
        })

    }
})

module.exports.addToFeed = function() {}
