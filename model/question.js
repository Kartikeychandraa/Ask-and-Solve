const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  userid: {
    type: String,
    required: true
  }
});


const question = mongoose.model("question", UserSchema);
module.exports = question;