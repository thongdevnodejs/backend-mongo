const { login, register } = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");

class AuthController {
  async register(req, res) {
    try {
      const { email, password, name, phone, address } = req.body;
      
      if (!email || !password || !name) {
        return errorResponse(res, 'Email, password and name are required', 400);
      }

      const result = await register({ email, password, name, phone, address });
      return successResponse(res, result, 'Register successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to register', 500, error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 400);
      }

      const result = await login(email, password);
      return successResponse(res, result, 'Login successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to login', 500, error);
    }
  }
}

module.exports = new AuthController();