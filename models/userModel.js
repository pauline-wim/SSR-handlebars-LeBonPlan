const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: "Username is required",
    maxLength: 20,
  },
  password: {
    type: String,
    required: "Password is required",
  },
  firstName: {
    type: String,
    maxLength: 20,
  },
  lastName: {
    type: String,
    maxLength: 30,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
