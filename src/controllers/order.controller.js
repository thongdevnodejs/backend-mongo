const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder,
  updateOrderTracking,
  getOrderStats
} = require('../services/order.service');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  // Get all orders with filtering, pagination, and sorting
  async getOrders(req, res) {
    try {
      const filters = req.query;
      const result = await getOrders(filters);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get orders', 500, error);
    }
  }

  // Get a specific order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 'Order ID is required', 400);
      }

      const result = await getOrderById(id);
      return successResponse(res, result);
    } catch (error) {
      if (error.message === 'Order not found') {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to get order', 500, error);
    }
  }

  // Get orders for the current user
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const filters = req.query;
      const result = await getOrdersByUser(userId, filters);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get user orders', 500, error);
    }
  }

  // Create a new order
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { shippingAddress } = req.body;

      const result = await createOrder(userId, shippingAddress);
      return successResponse(res, result, 'Order created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create order', 500, error);
    }
  }

  // Update order status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const updatedBy = req.user.id;

      if (!id || !status) {
        return errorResponse(res, 'Order ID and status are required', 400);
      }

      const result = await updateOrderStatus(id, status, note, updatedBy);
      return successResponse(res, result, `Order status updated to ${status}`);
    } catch (error) {
      if (error.message.includes('Cannot change status')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, 'Failed to update order status', 500, error);
    }
  }

  // Cancel an order
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const cancelledBy = req.user.id;

      if (!id) {
        return errorResponse(res, 'Order ID is required', 400);
      }

      const result = await cancelOrder(id, reason, cancelledBy);
      return successResponse(res, result, 'Order cancelled successfully');
    } catch (error) {
      if (error.message.includes('Cannot cancel')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, 'Failed to cancel order', 500, error);
    }
  }

  // Update tracking information
  async updateTracking(req, res) {
    try {
      const { id } = req.params;
      const { trackingNumber, carrier, estimatedDeliveryDate } = req.body;

      if (!id || !trackingNumber || !carrier) {
        return errorResponse(res, 'Order ID, tracking number, and carrier are required', 400);
      }

      const result = await updateOrderTracking(id, { trackingNumber, carrier, estimatedDeliveryDate });
      return successResponse(res, result, 'Tracking information updated successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to update tracking information', 500, error);
    }
  }

  // Get order statistics
  async getStats(req, res) {
    try {
      const filters = req.query;
      const result = await getOrderStats(filters);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get order statistics', 500, error);
    }
  }
}

module.exports = new OrderController();