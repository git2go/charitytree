var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectId = Schema.Types.ObjectId;

var NeedSchema = new Schema({
  title: String,
  description: String,
  cost: Number,
  quantity_needed: Number,
  number_purchased: Number,
  number_participants: Number,
  created_date: Date,
  lastModified: Date
});

var ProjectSchema = new Schema({
  _org: { type: ObjectId, ref: 'Organization' },
  created_date: Date,
  start_date: Date,
  end_date: Date,
  last_updated: Date,
  status: String,
  is_complete: Boolean,
  title: String,
  info: { type: String, trim: true, required: true },
  areas_of_focus: { type: [String], required: true },
  amount: {
    goal: Number,
    current: Number
  },
  total_donors_participating: Number,
  needs_list: [NeedSchema],
  // comments: [{ type: ObjectID, ref: 'Donor', comment: String, date: Date }],
  //faqs: [{title: String, description: String}],
  updates: [{ title: String, date: Date, description: String }],
  sponsors: [{ type: ObjectId, ref: 'Donor' }],
  images: [ObjectId],
  videos: [ObjectId]
});

NeedSchema.pre('save', function(next) {
  var now = new Date();
  if (!this.created_date) {
    this.created_date = now;
  }
  this.lastModified = now;
  next();
});

ProjectSchema.pre('save', function(next) {
  var now = new Date();
  if (this.created_date == null) {
    this.created_date = now;
  }
  this.last_updated = now;
  next();
});
//set up relationship between needs items and the donor who purchased them - org needs to see what donor donated what so it can push relevant updates

//what else in this schema needs to be required
var Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
