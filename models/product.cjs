const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String], // base64 or URLs
  specs: [{ key: String, value: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  category: String,
  stock: Number,
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
