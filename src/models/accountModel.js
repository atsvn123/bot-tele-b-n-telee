const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  data: String,
  isBuy: Boolean,
  orderId: String,
  productShortId: String,
  idTele: String
});

const Accounts = mongoose.model('Accounts', productSchema);
module.exports = Accounts