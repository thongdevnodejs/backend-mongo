const { createOrder, getOrder } = require('../services/order.service');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  async create(req, res) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return errorResponse(res, 'UserId is required', 400);
      }

      const order = await createOrder(userId);
      return successResponse(res, order, 'Order created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create order', 500, error);
    }
  }

  async get(req, res) {
    try {
      const result = await getOrder();
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get orders', 500, error);
    }
  }
}

module.exports = new OrderController();