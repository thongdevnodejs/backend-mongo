const Cart = require('../models/cart.model');
const Invoice = require('../models/invoice.model');
const OrderItem = require('../models/order-item.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const getOrder = async () => {
  try {
    const orders = await Order.find()
      .populate('userId')
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'Product'
        }
      });
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

const createOrder = async (userId) => {
  try {
    // Get cart items
    const productsInCart = await Cart.find({ userId });
    const user = await User.findById(userId);

    if (!productsInCart.length) {
      throw new Error('Cart is empty');
    }

    const orderItems = [];
    let totalPrice = 0;

    // Process each cart item
    for (const cartItem of productsInCart) {
      const product = await Product.findById(cartItem.productId);

      if (!product) {
        throw new Error(`Product with id ${cartItem.productId} not found`);
      }

      const orderItem = {
        productId: cartItem.productId,
        userId,
        quantity: cartItem.quantity,
        price: cartItem.quantity * product.price,
      };

      orderItems.push(orderItem);
      totalPrice += orderItem.price;
    }

    // Create the order
    const order = new Order({
      userId,
      totalPrice,
      items: orderItems
    });

    await order.save();

    // Create order items
    for (const item of orderItems) {
      const orderItem = new OrderItem({
        ...item,
        orderId: order._id
      });
      await orderItem.save();
    }

    // Clear the cart
    await Cart.deleteMany({ userId });

    // Generate invoice
    const invoice = new Invoice({
      orderId: order._id,
      userId,
      totalAmount: totalPrice,
      billingAddress: user?.address || ''
    });

    await invoice.save();

    return { order, invoice };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

module.exports = {
  getOrder,
  createOrder
};