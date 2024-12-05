const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }, // Reference to GridFS files
});

module.exports = mongoose.model('User', userSchema);
