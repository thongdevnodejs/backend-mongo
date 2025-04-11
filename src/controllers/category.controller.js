const { createCategoryService, getCategory, getCategoryById, updateCategory, deleteCategory } = require("../services/category.service");
const { successResponse, errorResponse } = require("../utils/response");

class CategoryController {
  async create(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const newCategory = await createCategoryService({ name });
      return successResponse(res, newCategory, 'Category created successfully', 201);
    } catch (error) {
      return errorResponse(res, 'Failed to create category', 500, error);
    }
  }

  async get(req, res) {
    try {
      const result = await getCategory();
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get categories', 500, error);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 'Category ID is required', 400);
      }

      const result = await getCategoryById(id);
      if (!result) {
        return errorResponse(res, 'Category not found', 404);
      }

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, 'Failed to get category', 500, error);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!id) {
        return errorResponse(res, 'Category ID is required', 400);
      }

      if (!name) {
        return errorResponse(res, 'Name is required', 400);
      }

      const result = await updateCategory(id, { name });
      return successResponse(res, result, 'Category updated successfully');
    } catch (error) {
      return errorResponse(res, 'Failed to update category', 500, error);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 'Category ID is required', 400);
      }

      const result = await deleteCategory(id);
      return successResponse(res, result, 'Category deleted successfully');
    } catch (error) {
      // Check if this is a constraint error (category linked to products)
      if (error.message && error.message.includes('linked to')) {
        return errorResponse(res, error.message, 400);
      }
      return errorResponse(res, 'Failed to delete category', 500, error);
    }
  }
}

module.exports = new CategoryController();