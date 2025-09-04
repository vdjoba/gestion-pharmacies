const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparer les mots de passe
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Réinitialiser le mot de passe
userSchema.methods.resetPassword = async function (newPassword) {
  this.password = await bcrypt.hash(newPassword, 10);
  await this.save();
};

module.exports = mongoose.model('User', userSchema);