const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true, trim: true },
  passwordHash:{ type: String, required: true },
  balance:    { type: Number, default: 0 },
  role:       { type: String, enum: ["primary","secondary"], default: "secondary" }
});

module.exports = mongoose.model("User", userSchema);
