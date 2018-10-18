var mongoose = require('mongoose');
var goodListSchema = require('../schemas/goodlist');

module.exports = mongoose.model('GoodList',goodListSchema);