var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectId = Schema.Types.ObjectId;

var OrganizationSchema = new Schema({
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
  images: [ObjectId],
  videos: [ObjectId],
  projects: [{ type: ObjectId, ref: 'Project' }],
  endorsements: [{ type: ObjectId, ref: 'Endorsement' }],
  followers: [{ type: ObjectId, ref: 'Donor' }],
  feed: [{ user: String,
           message: String,
           attachment: Schema.Types.Mixed,
           attachment_type: String,
           created_date: Date
        }]
});

// OrganizationSchema.add({ about: String });

OrganizationSchema.pre('save', function(next) {
  var now = new Date();
  if (this.signup_date == null) {
    this.signup_date = now;
  }
  next();
});

var Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
// module.exports = OrganizationSchema;
