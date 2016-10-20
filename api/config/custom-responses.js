"use strict";

const _ = require('lodash')

function buildErrorResponse(err, statusCode) {
    const errorObj = { status: statusCode }

    if (process.env.NODE_ENV === 'development') {
        errorObj.stack = err.stack
        errorObj.message = err.message
    }

    if (process.env.NODE_ENV === 'production') {
        if (statusCode === 500) {
            errorObj.message = "An internal server error occurred"
        }
        else {
            errorObj.message = err.message
        }
    }

    return errorObj
}

function badRequest(err) {
    const res = this
    res.status(400)

    return res.send(buildErrorResponse(err, 400));
}

function notFound(err) {
    const res = this
    res.status(404)

    return res.send(buildErrorResponse(err, 404));
}

function serverError(err) {
    const res = this
    res.status(500)

    return res.send(buildErrorResponse(err, 500));
}

function unauthorized(err) {
    const res = this
    res.status(401)

    return res.send(buildErrorResponse(err, 401));
}

module.exports = function(express) {
    _.assign(express.response.prototype, { notFound, badRequest, serverError })
}
