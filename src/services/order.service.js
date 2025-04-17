const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const getOrders = async (isAdmin = false, userId = null) => {
  try {
    // Nếu không phải admin, chỉ lấy đơn hàng của người dùng hiện tại
    const query = { isDeleted: { $ne: true } };
    if (!isAdmin && userId) {
      query.user = userId;
    }

    // Lấy tất cả đơn hàng, sắp xếp theo thời gian tạo mới nhất
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      });

    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

const getOrderById = async (orderId, userId = null, isAdmin = false) => {
  try {
    // Xây dựng query
    const query = { _id: orderId, isDeleted: { $ne: true } };

    // Nếu không phải admin, chỉ cho phép xem đơn hàng của chính mình
    if (!isAdmin && userId) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          model: 'Product'
        }
      });

    if (!order) {
      throw new Error('Order not found or you do not have permission to view this order');
    }

    return order;
  } catch (error) {
    console.error(`Error getting order ${orderId}:`, error);
    throw error;
  }
};

const createOrder = async (userId) => {
  try {
    // Lấy sản phẩm trong giỏ hàng
    const cartItems = await Cart.find({ userId }).populate('productId');

    if (!cartItems.length) {
      throw new Error('Cart is empty');
    }

    // Xử lý từng sản phẩm trong giỏ hàng
    const orderItems = [];
    let totalPrice = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.productId;

      if (!product) {
        throw new Error(`Product not found`);
      }

      // Kiểm tra số lượng trong kho
      if (product.amountInStore < cartItem.quantity) {
        throw new Error(`Not enough stock for product ${product.name}. Available: ${product.amountInStore}`);
      }

      // Tạo order item
      const orderItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        pictureURL: product.pictureURL
      };

      orderItems.push(orderItem);
      totalPrice += product.price * cartItem.quantity;

      // Cập nhật số lượng sản phẩm trong kho
      product.amountInStore -= cartItem.quantity;
      await product.save();
    }

    // Tạo đơn hàng
    const order = new Order({
      user: userId,
      items: orderItems,
      totalPrice,
      status: 'pending',
      transactionId: null // Will be updated by client
    });

    await order.save();

    // Xóa giỏ hàng
    await Cart.deleteMany({ userId });

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, status, isAdmin = false) => {
  try {
    // Chỉ admin mới có thể cập nhật trạng thái đơn hàng
    if (!isAdmin) {
      throw new Error('Only administrators can update order status');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    // Không cho phép thay đổi trạng thái nếu đơn hàng đã giao
    if (order.status === 'delivered' && status !== 'delivered') {
      throw new Error('Cannot change status of a delivered order');
    }

    // Cập nhật trạng thái đơn hàng
    order.status = status;

    await order.save();

    return order;
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw error;
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};