const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AoFSchema = new Schema({
  name: { type: String, required: true },
  tags: [String],
  count: { type: Number, default: 0 }
});

const AoF = mongoose.model('AoF', AoFSchema);

module.exports = AoF;
