"use strict";

const Promise = require('bluebird')
const Organization = require('../models').Organization
const Donor = require('../models').Donor
const bcrypt = Promise.promisifyAll(require('bcrypt'))
const errors = require('common-errors')

module.exports = {
    signup: function(req, res) {
        const { userType, username, pwd } = req.body

        return Promise.all([ Organization.findOne({ username }), Donor.findOne({ username }) ])
        .spread((organization, donor) => {
            if (organization || donor) { //username was found in either organization or donor collection
                throw new errors.AlreadyInUseError("username", "username")
            }

            return bcrypt.genSaltAsync(10) //generate password salt
        })
        .then(salt => {
            return bcrypt.hashAsync(pwd, salt) //hash password
        })
        .then(hash => {
            if (userType === 'organization') {
                return Organization.create({ name: req.body.org_name, username: username, password: hash })
            } else if (userType === 'donor') {
                const donorData = {
                    name: { first: req.body.first_name, last: req.body.last_name },
                    email: req.body.email,
                    username: username,
                    password: hash
                };

                return Donor.create(donorData)
            }

            throw new errors.NotPermittedError("cannot create account for unknown user type")
        })
        .then(user => {
            req.session.user = { uid: user._id, type: userType === 'organization' ? 'organization' : 'donor' };
            user.feed.push({ user: 'Charity Collective', message: 'Welcome to Charity Tree', created_date: new Date });

            return user.save()
        })
        .then(user => {
            return res.status(201).json({ status: 201, token: req.session.user.uid });
        })
        .catch(errors.AlreadyInUseError, errors.NotPermittedError, res.badRequest)
        .catch(res.serverError)
    },

    login: function(req, res) {
        const { username, pwd } = req.body
        //check if user is an organization or donor
        return Promise.all([ Organization.findOne({ username }), Donor.findOne({ username }) ])
        .spread((org, donor) => {
            const user = org || donor
            const userType = org ? 'organization' : 'donor'

            if (!user) { //user was not found
                throw new errors.NotFoundError("user")
            }

            return [ user, userType, bcrypt.compareAsync(pwd, user.password) ]
        })
        .spread((user, userType, validated) => {
            if (!validated) { //invalid password
                throw new error.ValidationError("invalid credentials")
            }

            req.session.user = { uid: user._id, type: userType };
            return res.status(201).json({ status: 201, token: req.session.user.uid });
        })
        .catch(errors.ValidationError, err => {
            return res.status(401).json({ status: 401, message: "Invalid username/password combination" });
        })
        .catch(errors.NotFoundError, res.notFound)
        .catch(res.serverError)
    },

    logout: function(req, res) {
        return new Promise(function(resolve, reject) {
            req.session.destroy(err => {
                if (err) {
                    return reject(new Error("could not destroy session"))
                }
                return resolve(null);
            })
        })
        .then(() => {
            return res.status(201).send();
        })
        .catch(res.serverError)
    }
}
