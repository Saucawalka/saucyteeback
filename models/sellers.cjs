const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
     name: String,
  location: String,
  rating: Number
})
module.exports = mongoose.model('Seller', SellerSchema);
module.exports = SellerSchema;