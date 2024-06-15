const mongoose = require("mongoose")

const depositSchema = new mongoose.Schema({
  idTele: String,
  txId: String,
  amount: Number,
  status: String,
});

const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = Deposit