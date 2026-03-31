const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '..', 'User'));

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicaments';

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

async function main() {
  await mongoose.connect(mongoUri);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.role = 'admin';
    existingUser.password = password;
    await existingUser.save();
    console.log(`Compte admin mis a jour: ${email}`);
  } else {
    const user = new User({
      email,
      password,
      role: 'admin',
    });

    await user.save();
    console.log(`Compte admin cree: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Creation admin impossible:', error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
