const paypalService = require('../services/paypal.service');
const stripeService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');
const Order = require('../models/order.model');
const Invoice = require('../models/invoice.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const OrderItem = require('../models/order-item.model');

class PaymentController {
  /**
   * Create a PayPal order from cart items
   */
  async createPayPalOrder(req, res) {
    try {
      const userId = req.user.id;

      // Get cart items
      const cartItems = await Cart.find({ userId }).populate('productId');

      if (!cartItems || cartItems.length === 0) {
        return errorResponse(res, 'Cart is empty', 400);
      }

      // Format items for PayPal
      const items = [];
      let totalAmount = 0;

      for (const item of cartItems) {
        if (!item.productId) {
          return errorResponse(res, 'One or more products in your cart no longer exist', 400);
        }

        const product = item.productId;
        const itemTotal = product.price * item.quantity;

        items.push({
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });

        totalAmount += itemTotal;
      }

      // Create PayPal order
      const order = await paypalService.createOrder(items, totalAmount);

      return successResponse(res, { orderId: order.id }, 'PayPal order created successfully');
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return errorResponse(res, 'Failed to create PayPal order', 500, error);
    }
  }

  /**
   * Capture a PayPal payment
   */
  async capturePayPalPayment(req, res) {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;

      if (!orderId) {
        return errorResponse(res, 'PayPal order ID is required', 400);
      }

      // Capture the payment
      const captureData = await paypalService.capturePayment(orderId);

      if (captureData.status !== 'COMPLETED') {
        return errorResponse(res, 'Payment not completed', 400);
      }

      // Get cart items
      const cartItems = await Cart.find({ userId }).populate('productId');

      if (!cartItems || cartItems.length === 0) {
        return errorResponse(res, 'Cart is empty', 400);
      }

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of cartItems) {
        if (!item.productId) continue;

        const product = item.productId;
        const itemTotal = product.price * item.quantity;

        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: itemTotal
        });

        totalAmount += itemTotal;

        // Update product inventory
        await Product.findByIdAndUpdate(product._id, {
          $inc: { amountInStore: -item.quantity }
        });
      }

      // Create order
      const newOrder = new Order({
        user: userId,
        totalPrice: totalAmount,
        status: 'processing',
        items: []
      });

      await newOrder.save();

      // Create order items and link them to the order
      for (const item of orderItems) {
        const orderItem = new OrderItem({
          orderId: newOrder._id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });

        await orderItem.save();

        // Add order item to order
        newOrder.items.push(orderItem._id);
      }

      await newOrder.save();

      // Create invoice
      const invoice = new Invoice({
        order: newOrder._id,
        user: userId,
        totalAmount,
        paymentStatus: 'paid',
        paymentDetails: {
          paymentMethod: 'PayPal',
          transactionId: captureData.id,
          paymentDate: new Date()
        }
      });

      await invoice.save();

      // Link invoice to order
      newOrder.invoice = invoice._id;
      await newOrder.save();

      // Clear cart
      await Cart.deleteMany({ userId });

      return successResponse(
        res,
        {
          order: newOrder,
          invoice,
          paypalDetails: captureData
        },
        'Payment captured successfully'
      );
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      return errorResponse(res, 'Failed to capture payment', 500, error);
    }
  }

  /**
   * Get PayPal order details
   */
  async getPayPalOrderDetails(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return errorResponse(res, 'PayPal order ID is required', 400);
      }

      const orderDetails = await paypalService.getOrderDetails(orderId);

      return successResponse(res, orderDetails, 'Order details retrieved successfully');
    } catch (error) {
      console.error('Error getting PayPal order details:', error);
      return errorResponse(res, 'Failed to get order details', 500, error);
    }
  }

  /**
   * Handle PayPal webhook events
   */
  async handlePayPalWebhook(req, res) {
    try {
      const event = req.body;

      // Process the webhook event
      const result = await paypalService.handleWebhookEvent(event);

      // Update order status based on webhook event
      if (result.orderId) {
        const order = await Order.findOne({ 'paymentDetails.transactionId': result.orderId });

        if (order) {
          if (result.event === 'PAYMENT.CAPTURE.COMPLETED') {
            order.status = 'completed';
            await order.save();
          } else if (result.event === 'PAYMENT.CAPTURE.DENIED') {
            order.status = 'cancelled';
            await order.save();
          }
        }
      }

      return successResponse(res, result, 'Webhook processed successfully');
    } catch (error) {
      console.error('Error handling PayPal webhook:', error);
      return errorResponse(res, 'Failed to process webhook', 500, error);
    }
  }

  // Existing Stripe payment methods can be kept here
}

module.exports = new PaymentController();
