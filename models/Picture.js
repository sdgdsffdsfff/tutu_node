var mongoose = require('mongoose');
var PictureSchema = require('../schemas/picture');

module.exports = mongoose.model('Picture',PictureSchema);