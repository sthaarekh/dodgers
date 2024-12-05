const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: false }, // Path or URL of the uploaded image
});

module.exports = mongoose.model('User', UserSchema);
