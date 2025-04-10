const { addCart, deleteCart, getCartItems, updateCartItem } = require('../services/cart.service');
const { successResponse, errorResponse } = require('../utils/response');

class CartController {
  async add(req, res) {
    try {
      const { userId, productId, quantity } = req.body;

      if (!userId || !productId || quantity === undefined) {
        return errorResponse(res, 'userId, productId, and quantity are required', 400);
      }

      const response = await addCart(userId, productId, quantity);
      return successResponse(res, response, 'Item added to cart successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to add item to cart', 500, error);
    }
  }

  async remove(req, res) {
    try {
      const { userId, productId } = req.body;

      if (!userId || !productId) {
        return errorResponse(res, 'userId and productId are required', 400);
      }

      const response = await deleteCart(userId, productId);
      return successResponse(res, response, 'Item removed from cart successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to remove item from cart', 500, error);
    }
  }

  async update(req, res) {
    try {
      const { userId, productId, quantity } = req.body;

      if (!userId || !productId || quantity === undefined) {
        return errorResponse(res, 'userId, productId, and quantity are required', 400);
      }

      const response = await updateCartItem(userId, productId, quantity);
      return successResponse(res, response, 'Cart item updated successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to update cart item', 500, error);
    }
  }

  async getByUserId(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return errorResponse(res, 'userId is required', 400);
      }

      const response = await getCartItems(userId);
      return successResponse(res, response);
    } catch (error) {
      return errorResponse(res, 'Failed to get cart items', 500, error);
    }
  }
}

module.exports = new CartController();