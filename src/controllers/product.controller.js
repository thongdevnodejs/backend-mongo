const { createProduct, getProduct, getProductId, updateProduct, deleteProduct } = require('../services/product.service');
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
      const { name, description, price, category, pictureURL, amountInStore, feature } = req.body;
console.log('hihi')
      if (!name || !price || !category || !pictureURL) {
        return errorResponse(res, 'Missing required fields: name, price, category, and pictureURL are required', 400);
      }

      const result = await createProduct(req.body);
      return successResponse(res, result, 'Product created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create product', 500, error);
    }
  }
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 'Product ID is required', 400);
      }

      const result = await updateProduct(id, req.body);
      return successResponse(res, result, 'Product updated successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to update product', 500, error);
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 'Product ID is required', 400);
      }

      const result = await deleteProduct(id);
      return successResponse(res, result, 'Product deleted successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to delete product', 500, error);
    }
  }
}

module.exports = new ProductController();