const User = require("../models/user.model");

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User is not existed");
    }
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const { email, password, name, phone, address } = userData;

    if (!email || !password || !name) {
      throw new Error("Email, password and name are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = new User({
      email,
      password,
      name,
      phone,
      address,
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

module.exports = {
  getUserByEmail,
  createUser,
};
