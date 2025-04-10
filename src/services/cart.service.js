const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const addCart = async (userId, productId, quantity) => {
  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if the product is already in the cart
    const cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      // Update quantity if product is already in the cart
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Add new product to the cart
      const newCartItem = new Cart({
        userId,
        productId,
        quantity
      });
      await newCartItem.save();
    }

    return { message: 'Product added to cart successfully' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

const deleteCart = async (userId, productId) => {
  try {
    const cartItem = await Cart.findOne({ userId, productId });

    if (!cartItem) {
      throw new Error('Product not found in cart');
    }

    await Cart.findByIdAndDelete(cartItem._id);

    return { message: 'Product removed from cart successfully' };
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

const updateCartItem = async (userId, productId, quantity) => {
  try {
    const cartItem = await Cart.findOne({ userId, productId });

    if (!cartItem) {
      throw new Error('Product not found in cart');
    }

    if (quantity <= 0) {
      // Remove item if quantity is set to 0 or less
      await Cart.findByIdAndDelete(cartItem._id);
      return { message: 'Product removed from cart as quantity was set to 0' };
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return { message: 'Cart updated successfully' };
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

const getCartItems = async (userId) => {
  try {
    const cartItems = await Cart.find({ userId })
      .populate('productId');

    if (!cartItems.length) {
      return { message: 'Cart is empty', items: [] };
    }

    return { message: 'Cart fetched successfully', items: cartItems };
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
};

module.exports = {
  addCart,
  deleteCart,
  updateCartItem,
  getCartItems
};