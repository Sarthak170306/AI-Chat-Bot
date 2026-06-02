const mongoose = require('mongoose');

/**
 * User schema
 * - username: display name for the user
 * - email: unique email address
 * - password: hashed password
 * - createdAt: account creation timestamp
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
