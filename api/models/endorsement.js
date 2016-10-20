const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EndorsementSchema = new Schema({
    title: { type: String, trim: true, required: true },
    review: { type: String, trim: true, required: true },
    rating: Number,
    // review_date: Date,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Donor', required: true }
},
{
    timestamps: true
});

const Endorsement = mongoose.model('Endorsement', EndorsementSchema);

module.exports = Endorsement;
