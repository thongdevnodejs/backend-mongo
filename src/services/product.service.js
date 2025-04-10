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
    if (!productData.name || !productData.price || !productData.category) {
      throw new Error('Missing required fields: name, price, and category are required');
    }

    const newProduct = new Product({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      image: productData.image,
      stock: productData.stock || 0
    });

    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

module.exports = {
  getProduct,
  getProductId,
  createProduct
};