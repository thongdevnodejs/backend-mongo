const Product = require('../models/product.model');

const getProduct = async () => {
  try {
    const products = await Product.find().populate('category');
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

const getProductId = async (id) => {
  try {
    const product = await Product.findById(id).populate('category');
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

const createProduct = async (productData) => {
  try {
    if (!productData.name || !productData.price || !productData.category || !productData.pictureURL) {
      throw new Error('Missing required fields: name, price, category, and pictureURL are required');
    }

    const newProduct = new Product({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      pictureURL: productData.pictureURL,
      amountInStore: productData.amountInStore || 0,
      feature: productData.feature || []
    });
console.log(newProduct)
    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

const updateProduct = async (id, productData) => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update only the fields that are provided
    if (productData.name) product.name = productData.name;
    if (productData.description) product.description = productData.description;
    if (productData.price) product.price = productData.price;
    if (productData.category) product.category = productData.category;
    if (productData.pictureURL) product.pictureURL = productData.pictureURL;
    if (productData.amountInStore !== undefined) product.amountInStore = productData.amountInStore;
    if (productData.feature) product.feature = productData.feature;

    await product.save();
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

module.exports = {
  getProduct,
  getProductId,
  createProduct,
  updateProduct,
  deleteProduct
};