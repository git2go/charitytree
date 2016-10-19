var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectId = Schema.Types.ObjectId;

var EndorsementSchema = new Schema({
  title: { type: String, trim: true },
  review: { type: String, trim: true },
  rating: Number,
  review_date: Date,
  org: String,
  author: String
});

var Endorsement = mongoose.model('Endorsement', EndorsementSchema);

module.exports = Endorsement;
