"use strict";

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

module.exports = function(req, res, next) {
    function badRequest(err) {
        res.status(400)
        return res.send(buildErrorResponse(err, 400));
    }

    function notFound(err) {
        res.status(404)
        return res.send(buildErrorResponse(err, 404));
    }

    function serverError(err) {
        res.status(500)
        return this.send(buildErrorResponse(err, 500));
    }

    function unauthorized(err) {
        res.status(401)
        return res.send(buildErrorResponse(err, 401));
    }

    function ok(statusCode, body) {
        if (typeof statusCode !== 'number') {
            body = statusCode
            statusCode = 200
        }
        
        res.status(statusCode)
        return res.send(body)
    }

    Object.assign(res, { badRequest, notFound, serverError, unauthorized, ok })
    next()
}
