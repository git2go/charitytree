"use strict";

const conn = require('../config/connections')
const streamifier = require('streamifier')
const _ = require('lodash')
const errors = require('common-errors')

module.exports.storeFileInGrid = function(file, user) {
    return new Promise(function(resolve, reject) {
        if (_.isEmpty(file)) return reject(new errors.ArgumentNullError("file"))
        if (!user) return reject(new errors.ArgumentNullError("user"))

        const fileId = conn.types.ObjectId(); //generate an id for the file
        const writeStream = conn.gridfs.createWriteStream({
            _id: fileId,
            length: Number(file.size),
            chunkSize: 1024 * 4,
            filename: file.originalname,
            content_type: file.mimetype,
            mode: 'w',
            metadata: { org: user }
        });

        streamifier.createReadStream(file.buffer).pipe(writeStream);

        writeStream.on('close', file => { resolve(file) });
        writeStream.on('error', err => { reject(err) });
    });
}

module.exports.findFileInGrid = function(options) {
    return new Promise(function(resolve, reject) {
        if (!options._id && !options.filename) {
            return reject(new errors.ArgumentNullError("file id or filename"))
        }

        conn.gridfs.exist(options, function(err, found) {
            if (err) { reject(err) }

            resolve(found)
        })
    });
}
