"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  username:{ type: String, required: true, unique: true },
  password: { type: String, required: true },
  about: String,
  address: { type: String, trim: true },
  signup_date: Date,
  // areas_of_focus: [{ type: ObjectId, ref: 'AoF' }],
  areas_of_focus: [String],
  profile_img: {
    data: Buffer,
    contentType: String,
    filename: String,
  },
  images: [Schema.Types.ObjectId],
  videos: [Schema.Types.ObjectId],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  endorsements: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'Donor' }],
  feed: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
}, {
    timestamps: true
});

// OrganizationSchema.add({ about: String });

// OrganizationSchema.pre('save', function(next) {
//   if (this.signup_date == null) {
//     this.signup_date = Date.now();
//   }
//   next();
// });

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
// module.exports = OrganizationSchema;
