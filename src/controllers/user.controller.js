const { getUserByEmail } = require("../services/user.service");
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
}

module.exports = new UserController();