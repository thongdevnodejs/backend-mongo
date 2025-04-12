const { addCart, deleteCart, getCartItems, updateCartItem } = require('../services/cart.service');
const { successResponse, errorResponse } = require('../utils/response');

class CartController {
  async add(req, res) {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      if (!productId || quantity === undefined) {
        return errorResponse(res, 'productId and quantity are required', 400);
      }

      const response = await addCart(userId, productId, quantity);
      return successResponse(res, response, 'Item added to cart successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to add item to cart', 500, error);
    }
  }

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      if (!productId) {
        return errorResponse(res, 'productId is required', 400);
      }

      const response = await deleteCart(userId, productId);
      return successResponse(res, response, 'Item removed from cart successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to remove item from cart', 500, error);
    }
  }

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      if (!productId || quantity === undefined) {
        return errorResponse(res, 'productId and quantity are required', 400);
      }

      const response = await updateCartItem(userId, productId, quantity);
      return successResponse(res, response, 'Cart item updated successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to update cart item', 500, error);
    }
  }

  async getByUserId(req, res) {
    try {
      // Get userId from the authenticated user
      const userId = req.user.id;

      if (!userId) {
        return errorResponse(res, 'User ID not found in token', 400);
      }

      const response = await getCartItems(userId);
      return successResponse(res, response);
    } catch (error) {
      return errorResponse(res, 'Failed to get cart items', 500, error);
    }
  }
}

module.exports = new CartController();