const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin','employee'], default: 'employee' },
  status: { type: String, enum: ['pending','approved','blocked','rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
