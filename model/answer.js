const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
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