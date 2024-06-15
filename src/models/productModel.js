const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  shortId: String,
  minBuy: Number,
  maxBuy: Number
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product