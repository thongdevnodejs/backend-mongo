const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const addCart = async (userId, productId, quantity) => {
  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if the requested quantity is valid
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // Check if the product is already in the cart
    const cartItem = await Cart.findOne({ userId, productId });

    let newQuantity = quantity;

    if (cartItem) {
      // Calculate new total quantity
      newQuantity = cartItem.quantity + quantity;
    }

    // Check if there's enough stock
    if (newQuantity > product.amountInStore) {
      throw new Error(`Not enough stock. Only ${product.amountInStore} items available.`);
    }

    if (cartItem) {
      // Update quantity if product is already in the cart
      cartItem.quantity = newQuantity;
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

    return {
      message: 'Product added to cart successfully',
      availableStock: product.amountInStore,
      requestedQuantity: quantity,
      cartQuantity: newQuantity
    };
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
    // Check if the product exists in the cart
    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      throw new Error('Product not found in cart');
    }

    // Check if the product still exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product no longer exists in the store');
    }

    if (quantity <= 0) {
      // Remove item if quantity is set to 0 or less
      await Cart.findByIdAndDelete(cartItem._id);
      return { message: 'Product removed from cart as quantity was set to 0' };
    }

    // Check if there's enough stock
    if (quantity > product.amountInStore) {
      throw new Error(`Not enough stock. Only ${product.amountInStore} items available.`);
    }

    // Update the cart item quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return {
      message: 'Cart updated successfully',
      availableStock: product.amountInStore,
      updatedQuantity: quantity
    };
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

const getCartItems = async (userId) => {
  try {
    // Find all cart items for the user
    const cartItems = await Cart.find({ userId });

    if (!cartItems.length) {
      return { message: 'Cart is empty', items: [] };
    }

    // Process each cart item to check if the product still exists
    const processedItems = await Promise.all(cartItems.map(async (item) => {
      // Try to find the product
      const product = await Product.findById(item.productId);

      // Create a new object with all cart item properties
      const cartItemObj = item.toObject();

      // Add a flag indicating if the product exists
      cartItemObj.productExists = !!product;

      // If product exists, add its details
      if (product) {
        cartItemObj.productDetails = product;
      }

      return cartItemObj;
    }));

    return {
      message: 'Cart fetched successfully',
      items: processedItems
    };
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