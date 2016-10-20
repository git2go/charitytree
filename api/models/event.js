"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    user: Schema.Types.ObjectId,
    message: String,
    attachment: Schema.Types.Mixed,
    attachment_type: String,
},
{
    timestamps: true
})

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
