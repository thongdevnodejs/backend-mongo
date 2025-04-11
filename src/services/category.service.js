
const Category = require('../models/category.model');
const Product = require('../models/product.model');

const createCategoryService = async (categoryData) => {
  try {
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }

    const newCategory = new Category({
      name: categoryData.name,
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

const getCategoryById = async (id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw error;
  }
};

const updateCategory = async (id, categoryData) => {
  try {
    if (!id) {
      throw new Error('Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Update only the fields that are provided
    if (categoryData.name) {
      category.name = categoryData.name;
    }

    await category.save();
    return category;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    if (!id) {
      throw new Error('Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if any products are using this category
    const productsWithCategory = await Product.find({ category: id });

    if (productsWithCategory.length > 0) {
      throw new Error(`Cannot delete category because it is linked to ${productsWithCategory.length} product(s). Please reassign or delete these products first.`);
    }

    await Category.findByIdAndDelete(id);
    return { message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

module.exports = {
  createCategoryService,
  getCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};