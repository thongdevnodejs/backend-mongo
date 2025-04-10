
const Category = require('../models/category.model');

const createCategoryService = async (categoryData) => {
  try {
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }

    const newCategory = new Category({
      name: categoryData.name,
      pictureURL: categoryData.pictureURL
    });

    await newCategory.save();
    return newCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

const getCategory = async () => {
  try {
    const categories = await Category.find();
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

module.exports = {
  createCategoryService,
  getCategory
};