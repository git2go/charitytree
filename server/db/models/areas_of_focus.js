var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectId = Schema.Types.ObjectId;

var AoFSchema = new Schema({
  name: { type: String, required: true },
  tags: [String],
  count: { type: Number, default: 0 }
});

var AoF = mongoose.model('AoF', AoFSchema);

module.exports = AoF;

// module.exports = AoFSchema;
