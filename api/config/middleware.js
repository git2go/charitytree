"use strict";

const errors = require('common-errors')

module.exports = {
    verifyCredentials: function(req, res, next) {
        if (req.session && req.session.user) {
            next();
        }

        return res.unauthorized(new errors.AuthenticationRequiredError("Unauthorized"))
    }
}
