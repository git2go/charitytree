"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// var endorsementSchema = new Schema({
//   title: { type: String, trim: true },
//   review: { type: String, trim: true },
//   rating: Number,
//   review_date: Date,
//   org: { type: ObjectId, ref: 'Organization' }
// });

const DonorSchema = new Schema({
    name: {
        first: { type: String, trim: true, required: true },
        last: { type: String, trim: true, required: true }
    },
    username: {type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: {type: String, required: true },
    signup_date: Date,
    profile_img: { data: Buffer, contentType: String },
    // areas_of_focus: [{ type: ObjectId, ref: 'AoF' }],
    areas_of_focus: [String],
    sponsored_projects: [{ project: { type: Schema.Types.ObjectId, ref: 'Project' }, donation: Number }],
    following: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
    endorsements: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }],
    feed: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
}, {
    timestamps: true
});

// DonorSchema.pre('save', function(next) {
//   if (this.signup_date == null) {
//     this.signup_date = Date.now();
//   }
//   next();
// });

const Donor = mongoose.model('Donor', DonorSchema);

module.exports = Donor;
// module.exports = DonorSchema;
