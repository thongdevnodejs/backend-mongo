const { getUserByEmail, updateUser, getUserById, changePassword } = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/response");

class UserController {
  async getByEmail(req, res) {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await getUserByEmail(email);
      if (!result) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get user', 500, error);
    }
  }

  async create(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password and name are required' });
      }

      const result = await createUser({ email, password, name });
      return successResponse(res, result, 'User created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create user', 500, error);
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id; // Lấy ID người dùng từ token
console.log("user id", userId)
      // Lấy thông tin người dùng từ database
      const user = await getUserById(userId);

      // Loại bỏ trường password trước khi trả về
      const userWithoutPassword = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return successResponse(res, userWithoutPassword);
    } catch (error) {
      if (error.message.includes('User not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to get profile', 500, error);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id; // Lấy ID người dùng từ token
      const { name, email, phone, address } = req.body;

      // Kiểm tra xem có dữ liệu cập nhật không
      if (!name && !email && !phone && !address) {
        return errorResponse(res, 'No data provided for update', 400);
      }

      // Cập nhật thông tin người dùng
      const updatedUser = await updateUser(userId, { name, email, phone, address });

      // Trả về thông tin người dùng đã cập nhật
      return successResponse(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      // Xử lý các lỗi cụ thể
      if (error.message.includes('Email already in use')) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes('Phone number already in use')) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes('User not found')) {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to update profile', 500, error);
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.id; // Lấy ID người dùng từ token
      const { currentPassword, newPassword } = req.body;

      // Kiểm tra xem có cung cấp mật khẩu hiện tại và mật khẩu mới không
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Current password and new password are required', 400);
      }

      // Thay đổi mật khẩu
      const result = await changePassword(userId, { currentPassword, newPassword });

      // Trả về kết quả
      return successResponse(res, result, 'Password changed successfully');
    } catch (error) {
      // Xử lý các lỗi cụ thể
      if (error.message.includes('Current password is incorrect')) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes('New password must be different')) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes('User not found')) {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to change password', 500, error);
    }
  }
}

module.exports = new UserController();