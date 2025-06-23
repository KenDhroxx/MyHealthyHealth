const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find user by email (change this to your email)
    const email = 'admin@example.com'; // Change this to your email
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new admin user
      user = await User.create({
        name: 'Admin User',
        email: email,
        password: 'admin123', // Change this password
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
    } else {
      // Update existing user to admin
      user.role = 'admin';
      await user.save();
      console.log('✅ User updated to admin successfully');
    }
    
    console.log('Admin details:', {
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();