var mongoose = require('mongoose');
var grid = require('gridfs-stream');
grid.mongo = mongoose.mongo;

var url = 'mongodb://localhost:27017/charity_tree';

mongoose.connect(url);
var connection = mongoose.connection;
var gridfs = grid(connection.db);

module.exports.connection = connection;
module.exports.gridfs = gridfs;
module.exports.types = mongoose.Types;
