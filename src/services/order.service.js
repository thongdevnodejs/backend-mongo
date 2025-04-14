const Cart = require('../models/cart.model');
const Invoice = require('../models/invoice.model');
const OrderItem = require('../models/order-item.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendShippingConfirmationEmail,
  sendOrderCancellationEmail
} = require('./notification.service');

const getOrders = async (filters = {}) => {
  try {
    // Build query based on filters
    const query = { isDeleted: { $ne: true } };

    if (filters.userId) {
      query.user = filters.userId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Search by tracking number
    if (filters.trackingNumber) {
      query.trackingNumber = { $regex: filters.trackingNumber, $options: 'i' };
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = filters.sortField || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Execute query with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'Product',
          select: 'name price pictureURL'
        }
      });

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

const getOrderById = async (orderId) => {
  try {
    const order = await Order.findOne({ _id: orderId, isDeleted: { $ne: true } })
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'Product'
        }
      })
      .populate('invoice');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  } catch (error) {
    console.error(`Error getting order ${orderId}:`, error);
    throw error;
  }
};

const getOrdersByUser = async (userId, filters = {}) => {
  try {
    filters.userId = userId;
    return await getOrders(filters);
  } catch (error) {
    console.error(`Error getting orders for user ${userId}:`, error);
    throw error;
  }
};

const createOrder = async (userId, shippingAddress) => {
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

      // Check if product is in stock
      if (product.amountInStore < cartItem.quantity) {
        throw new Error(`Not enough stock for product ${product.name}. Available: ${product.amountInStore}`);
      }

      const orderItem = {
        productId: cartItem.productId,
        orderId: null, // Will be set after order creation
        quantity: cartItem.quantity,
        price: cartItem.quantity * product.price,
      };

      orderItems.push(orderItem);
      totalPrice += orderItem.price;

      // Update product stock
      product.amountInStore -= cartItem.quantity;
      await product.save();
    }

    // Create the order
    const order = new Order({
      user: userId,
      totalPrice,
      items: [], // Will be populated after order items are created
      shippingAddress: shippingAddress || {
        name: user.name,
        address: user.address,
        phone: user.phone
      },
      statusHistory: [
        {
          status: 'pending',
          note: 'Order created',
          updatedBy: userId
        }
      ]
    });

    await order.save();

    // Create order items
    const savedOrderItems = [];
    for (const item of orderItems) {
      const orderItem = new OrderItem({
        ...item,
        orderId: order._id
      });
      const savedItem = await orderItem.save();
      savedOrderItems.push(savedItem._id);
    }

    // Update order with order items
    order.items = savedOrderItems;
    await order.save();

    // Clear the cart
    await Cart.deleteMany({ userId });

    // Generate invoice
    const invoice = new Invoice({
      order: order._id,
      user: userId,
      totalAmount: totalPrice,
      billingAddress: shippingAddress?.address || user?.address || ''
    });

    await invoice.save();

    // Update order with invoice reference
    order.invoice = invoice._id;
    await order.save();

    // Send order confirmation email
    const userDetails = await User.findById(userId);
    if (userDetails) {
      await sendOrderConfirmationEmail(order, userDetails);
    }

    return { order, invoice };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, status, note, updatedBy) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if status is valid
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    // Don't allow status change if order is already cancelled or delivered
    if (order.status === 'cancelled' && status !== 'cancelled') {
      throw new Error('Cannot change status of a cancelled order');
    }

    if (order.status === 'delivered' && status !== 'delivered') {
      throw new Error('Cannot change status of a delivered order');
    }

    // Update order status
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      note: note || `Status changed to ${status}`,
      updatedBy,
      timestamp: new Date()
    });

    await order.save();

    // Send status update email
    const user = await User.findById(updatedBy);
    if (user) {
      await sendOrderStatusUpdateEmail(order, user, status);
    }

    return order;
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw error;
  }
};

const cancelOrder = async (orderId, reason, cancelledBy) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Don't allow cancellation if order is already delivered
    if (order.status === 'delivered') {
      throw new Error('Cannot cancel a delivered order');
    }

    // Don't allow cancellation if order is already cancelled
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    // Update order status
    order.status = 'cancelled';

    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      note: reason || 'Order cancelled',
      updatedBy: cancelledBy,
      timestamp: new Date()
    });

    // Return items to inventory
    for (const itemId of order.items) {
      const orderItem = await OrderItem.findById(itemId);
      if (orderItem) {
        const product = await Product.findById(orderItem.productId);
        if (product) {
          product.amountInStore += orderItem.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    // Send cancellation email
    const user = await User.findById(cancelledBy);
    if (user) {
      await sendOrderCancellationEmail(order, user, reason);
    }

    return order;
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};

const updateOrderTracking = async (orderId, trackingData) => {
  try {
    const { trackingNumber, carrier, estimatedDeliveryDate } = trackingData;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update tracking information
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

    // If tracking info is added and order is in processing status, update to shipped
    if (trackingNumber && order.status === 'processing') {
      order.status = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        note: `Order shipped with ${carrier}, tracking number: ${trackingNumber}`,
        timestamp: new Date()
      });

      // Send shipping confirmation email
      const user = await User.findById(order.user);
      if (user) {
        await sendShippingConfirmationEmail(order, user);
      }
    }

    await order.save();
    return order;
  } catch (error) {
    console.error(`Error updating tracking for order ${orderId}:`, error);
    throw error;
  }
};

const getOrderStats = async (filters = {}) => {
  try {
    const query = { isDeleted: { $ne: true } };

    // Apply date filters if provided
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Count orders by status
    const statusCounts = await Order.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { ...query, status: { $nin: ['cancelled', 'payment_failed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    // Get recent orders
    const recentOrders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('status totalPrice createdAt');

    // Format status counts into an object
    const statusCountsObj = {};
    statusCounts.forEach(item => {
      statusCountsObj[item._id] = item.count;
    });

    return {
      totalOrders: await Order.countDocuments(query),
      statusCounts: statusCountsObj,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
      recentOrders
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw error;
  }
};

module.exports = {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  updateOrderTracking,
  getOrderStats
};