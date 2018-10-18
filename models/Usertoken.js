var mongoose = require('mongoose');
var usertokenSchema = require('../schemas/usertoken');

module.exports = mongoose.model('Usertoken',usertokenSchema);