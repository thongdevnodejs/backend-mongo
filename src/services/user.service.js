const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
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

const updateUser = async (userId, userData) => {
  try {
    const { name, email, phone, address } = userData;

    // Kiểm tra xem email và số điện thoại đã tồn tại chưa (nếu có thay đổi)
    const existingChecks = [];

    if (email) {
      existingChecks.push(
        User.findOne({ email, _id: { $ne: userId } }).then(user => {
          if (user) throw new Error("Email already in use by another account");
        })
      );
    }

    if (phone) {
      existingChecks.push(
        User.findOne({ phone, _id: { $ne: userId } }).then(user => {
          if (user) throw new Error("Phone number already in use by another account");
        })
      );
    }

    // Chờ tất cả các kiểm tra hoàn thành
    await Promise.all(existingChecks);

    // Cập nhật thông tin người dùng
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Loại bỏ trường password trước khi trả về
    const userWithoutPassword = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return userWithoutPassword;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  try {
    // Kiểm tra xem có cung cấp mật khẩu hiện tại và mật khẩu mới không
    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    // Lấy thông tin người dùng từ database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // Kiểm tra xem mật khẩu mới có giống mật khẩu hiện tại không
    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    return { message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  changePassword,
};
