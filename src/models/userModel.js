const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  idTele: { type: Number, unique: true },
  balance: { type: Number, default: 0 },
  total_recharge: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);
module.exports = User