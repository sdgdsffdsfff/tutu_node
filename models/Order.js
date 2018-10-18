var mongoose = require('mongoose');
var orderSchema = require('../schemas/order');

module.exports = mongoose.model('Order',orderSchema);