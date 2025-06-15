const mongoose = require("mongoose");

const monthlyPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  amount: Number,
  category: String,
  startMonth: String, // format: 'YYYY-MM'
  endMonth: String,   // optional
  note: String
});

module.exports = mongoose.model("MonthlyPayment", monthlyPaymentSchema);
