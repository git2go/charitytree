const organization = require('./organization.js');
const donor = require('./donor.js');
const project = require('./project.js');
const aof = require('./areas_of_focus.js');
const endorsement = require('./endorsement.js');
const _ = require('lodash')

_.mixin({ pickSchema: function(model, excluded) {
    var fields = [];
    model.schema.eachPath(path => {
       _.isArray(excluded) ? excluded.indexOf(path) < 0 ? fields.push(path) : false : path === excluded ? false : fields.push(path);
    });
    return fields;
   }
});

module.exports = {
    Organization: organization,
    Donor: donor,
    Project: project,
    AoF: aof,
    Endorsement: endorsement
};
