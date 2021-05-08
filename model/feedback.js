const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
});

const feedes = mongoose.model("feedes", UserSchema);
module.exports = feedes;