const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
  },
  userid: {
    type: String,
  },
  questionid: {
    type: String,
  }
});


const answer = mongoose.model("answer", UserSchema);
module.exports = answer;