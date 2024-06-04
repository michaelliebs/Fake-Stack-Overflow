// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/users'); 
mongoose.connect('mongodb://127.0.0.1:27017/fake_so', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const createAdminUser = async (username, password) => {
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Admin user already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const adminUser = new User({
      username,
      password: hash,
      firstName: 'Admin',
      lastName: 'User',
      email: username + '@example.com',
      reputation: 1000, // Optional: set initial reputation for admin
      isAdmin: true
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
}

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log('Usage: node init.js <username> <password>');
    process.exit(1);
  }

  const [username, password] = args;
  await createAdminUser(username, password);
  mongoose.disconnect();
}

main();
