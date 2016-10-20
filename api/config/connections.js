"use strict";

const mongoose = require('mongoose')
const grid = require('gridfs-stream')
const redis = require("redis")
const Promise = require('bluebird')

mongoose.Promise = Promise;
grid.mongo = mongoose.mongo;
mongoose.connect(process.env.MONGODB_URI);

Promise.promisifyAll(redis.RedisClient.prototype)

module.exports = {
    mongoose: mongoose.connection,

    gridfs: grid(mongoose.connection.db),

    redis: redis.createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT })
}
