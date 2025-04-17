const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('../services/order.service');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  // Lấy danh sách đơn hàng (admin: tất cả, user: chỉ của mình)
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.isAdmin;

      const result = await getOrders(isAdmin, userId);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get orders', 500, error);
    }
  }

  // Lấy chi tiết đơn hàng theo ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.isAdmin;

      if (!id) {
        return errorResponse(res, 'Order ID is required', 400);
      }

      const result = await getOrderById(id, userId, isAdmin);
      return successResponse(res, result);
    } catch (error) {
      if (error.message.includes('Order not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to get order', 500, error);
    }
  }

  // Tạo đơn hàng mới
  async create(req, res) {
    try {
      const userId = req.user.id;

      const result = await createOrder(userId);
      return successResponse(res, result, 'Order created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create order', 500, error);
    }
  }

  // Cập nhật trạng thái đơn hàng (chỉ admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const isAdmin = req.user.isAdmin;

      if (!id || !status) {
        return errorResponse(res, 'Order ID and status are required', 400);
      }

      // Kiểm tra quyền admin
      if (!isAdmin) {
        return errorResponse(res, 'Only administrators can update order status', 403);
      }

      const result = await updateOrderStatus(id, status, isAdmin);
      return successResponse(res, result, `Order status updated to ${status}`);
    } catch (error) {
      if (error.message.includes('Cannot change status')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, 'Failed to update order status', 500, error);
    }
  }


}

module.exports = new OrderController();