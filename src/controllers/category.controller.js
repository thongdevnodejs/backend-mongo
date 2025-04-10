const { createCategoryService, getCategory } = require("../services/category.service");
const { successResponse, errorResponse } = require("../utils/response");

class CategoryController {
  async create(req, res) {
    try {
      const { name, pictureURL } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const newCategory = await createCategoryService({ name, pictureURL });
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
}

module.exports = new CategoryController();