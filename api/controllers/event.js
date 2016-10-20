"use strict";

const Organization = require('./organization')
const Donor = require('./donor')
const feedService = require('../services/feedService')
const redisClient = require('../config/connections').redis

module.exports = function(socket) {
    const feed = socket.of('/feed');

    feed.on('connection', client => {
        //when client connects, store client identifier in redis
        return redisClient.hsetAsync("connections", `client:${client.id}`, client.id)
        .then(() => {
            client.on('disconnect', function() {
                return redisClient.hdelAsync("connections", `client:${client.id}`)
                .finally(() => {
                    client.emit('stopPolling');
                })
            });

            client.on('getFeed', function(userOpts) {
                return redisClient.hsetAsync("connections", `client:${client.id}`, token)
                .then(() => {
                    return feedService.getFeed(userOpts)
                })
                .then(feed => {
                    client.emit('storeFeed', feed)
                })
            });

            client.on('feed_updates', function(userOpts, timestamp) {
                return feedService.getFeedUpdates(userOpts, timestamp)
                .then(updates => {
                    client.emit('updateFeed', updates);
                })
            });

            //this is a donor action
            client.on('follow', function(donorID, orgID) {

            });

            //this is a donor action
            client.on('donation', function(donorID, projectID, amount) {

            });

            //donor action
            client.on('endorsement', function(donorID, orgID) {

            });

            //donor or org action
            client.on('profile_update', function(username) {

            });
        })
    });

    return feed;
};
