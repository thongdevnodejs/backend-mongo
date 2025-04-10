const { createProduct, getProduct, getProductId } = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/response');

class ProductController {
  async get(req, res) {
    try {
      const result = await getProduct();
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get products', 500, error);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 'Product ID is required', 400);
      }

      const result = await getProductId(id);
      if (!result) {
        return errorResponse(res, 'Product not found', 404);
      }

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get product', 500, error);
    }
  }

  async createProduct(req, res) {
    try {
      const { name, description, price, category, image, stock } = req.body;
      
      if (!name || !price || !category || !image) {
        return errorResponse(res, 'Missing required fields', 400);
      }

      const result = await createProduct(req.body);
      return successResponse(res, result, 'Product created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create product', 500, error);
    }
  }
}

module.exports = new ProductController();