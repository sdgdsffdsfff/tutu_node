var mongoose = require('mongoose');
var PersonalSchema = require('../schemas/personal');

module.exports = mongoose.model('Personal',PersonalSchema);