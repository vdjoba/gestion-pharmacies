const mongoose = require('mongoose');
const User = require('../User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicaments';

const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

const run = async () => {
  await mongoose.connect(MONGODB_URI);

  const users = await User.find();
  let updatedCount = 0;

  for (const user of users) {
    const normalizedEmail = normalizeEmail(user.email);

    if (!normalizedEmail || normalizedEmail === user.email) {
      continue;
    }

    const conflictingUser = await User.findOne({
      _id: { $ne: user._id },
      email: normalizedEmail,
    });

    if (conflictingUser) {
      console.warn(
        `Conflit detecte: ${user.email} ne peut pas etre normalise en ${normalizedEmail} car cet email existe deja.`,
      );
      continue;
    }

    user.email = normalizedEmail;
    await user.save();
    updatedCount += 1;
    console.log(`Email normalise: ${normalizedEmail}`);
  }

  console.log(`Migration terminee. ${updatedCount} utilisateur(s) mis a jour.`);
};

run()
  .catch((error) => {
    console.error('Echec de la migration des emails:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
