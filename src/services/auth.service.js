const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/auth');

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User is not existed');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user);
    
    // Create user object without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      orders: user.orders,
      cartItems: user.cartItems
    };

    return {
      user: userResponse,
      token
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

const register = async (userData) => {
  try {
    const { email, password, name, phone, address } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      address
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);
    return token;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

module.exports = {
  login,
  register
};
