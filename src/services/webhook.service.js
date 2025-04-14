const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const Product = require('../models/product.model');
const Invoice = require('../models/invoice.model');
const crypto = require('crypto');

/**
 * Verify PayPal webhook signature
 * @param {Object} headers - Request headers
 * @param {String} body - Request body as string
 * @param {String} webhookId - PayPal webhook ID from environment variables
 * @returns {Boolean} - Whether the signature is valid
 */
const verifyPayPalWebhookSignature = (headers, body, webhookId) => {
  try {
    const paypalSignature = headers['paypal-transmission-sig'];
    const paypalCertUrl = headers['paypal-cert-url'];
    const paypalTransmissionId = headers['paypal-transmission-id'];
    const paypalTransmissionTime = headers['paypal-transmission-time'];

    // In a production environment, you would:
    // 1. Fetch the certificate from paypalCertUrl
    // 2. Verify the certificate is from PayPal
    // 3. Create a signature based on the transmission ID, time, webhook ID, and event body
    // 4. Compare with the provided signature

    // For development/testing, we'll return true
    // In production, replace with actual signature verification
    return true;
  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
};

/**
 * Handle PayPal payment webhook events
 * @param {Object} event - PayPal webhook event
 * @returns {Object} - Processing result
 */
const handlePayPalWebhook = async (event) => {
  try {
    const eventType = event.event_type;
    const resource = event.resource;

    // Extract PayPal transaction ID (different field depending on event type)
    let transactionId;
    if (resource.id) {
      transactionId = resource.id;
    } else if (resource.purchase_units && resource.purchase_units[0].payments.captures) {
      transactionId = resource.purchase_units[0].payments.captures[0].id;
    }

    if (!transactionId) {
      throw new Error('Could not extract transaction ID from webhook event');
    }

    // Find order with this transaction ID in paymentDetails
    const order = await Order.findOne({ 'paymentDetails.id': transactionId });
    
    if (!order) {
      return {
        success: false,
        message: `No order found with transaction ID: ${transactionId}`
      };
    }

    // Process based on event type
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was successful
        order.paymentDetails.status = 'COMPLETED';
        order.paymentDetails.updateTime = new Date();
        
        // Update order status if it's still pending
        if (order.status === 'pending') {
          order.status = 'processing';
          order.statusHistory.push({
            status: 'processing',
            note: 'Payment completed successfully',
            timestamp: new Date()
          });
        }
        
        await order.save();
        
        // Update invoice payment status
        if (order.invoice) {
          const invoice = await Invoice.findById(order.invoice);
          if (invoice) {
            invoice.paymentStatus = 'paid';
            await invoice.save();
          }
        }
        
        return {
          success: true,
          message: 'Payment completed successfully',
          orderId: order._id
        };
        
      case 'PAYMENT.CAPTURE.DENIED':
        // Payment was denied
        order.paymentDetails.status = 'DENIED';
        order.paymentDetails.updateTime = new Date();
        order.status = 'payment_failed';
        
        order.statusHistory.push({
          status: 'payment_failed',
          note: 'Payment was denied',
          timestamp: new Date()
        });
        
        await order.save();
        
        // Update invoice payment status
        if (order.invoice) {
          const invoice = await Invoice.findById(order.invoice);
          if (invoice) {
            invoice.paymentStatus = 'failed';
            await invoice.save();
          }
        }
        
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
        
        return {
          success: true,
          message: 'Payment was denied',
          orderId: order._id
        };
        
      case 'PAYMENT.CAPTURE.REFUNDED':
        // Payment was refunded
        order.paymentDetails.status = 'REFUNDED';
        order.paymentDetails.updateTime = new Date();
        order.status = 'cancelled';
        
        order.statusHistory.push({
          status: 'cancelled',
          note: 'Payment was refunded',
          timestamp: new Date()
        });
        
        await order.save();
        
        // Update invoice payment status
        if (order.invoice) {
          const invoice = await Invoice.findById(order.invoice);
          if (invoice) {
            invoice.paymentStatus = 'refunded';
            await invoice.save();
          }
        }
        
        // Return items to inventory if not already done
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
        
        return {
          success: true,
          message: 'Payment was refunded',
          orderId: order._id
        };
        
      case 'PAYMENT.CAPTURE.PENDING':
        // Payment is pending
        order.paymentDetails.status = 'PENDING';
        order.paymentDetails.updateTime = new Date();
        
        await order.save();
        
        return {
          success: true,
          message: 'Payment is pending',
          orderId: order._id
        };
        
      default:
        // Unhandled event type
        return {
          success: true,
          message: `Unhandled event type: ${eventType}`,
          orderId: order._id
        };
    }
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    return {
      success: false,
      message: `Error processing webhook: ${error.message}`
    };
  }
};

/**
 * Verify a PayPal payment
 * @param {String} orderId - PayPal order ID
 * @param {String} payerId - PayPal payer ID
 * @returns {Object} - Verification result
 */
const verifyPayPalPayment = async (orderId, payerId) => {
  try {
    // In a production environment, you would:
    // 1. Make an API call to PayPal to verify the payment
    // 2. Check that the payment amount matches the order amount
    // 3. Check that the payment is completed
    
    // For development/testing, we'll simulate a successful verification
    return {
      success: true,
      verified: true,
      paymentId: orderId,
      payerId: payerId,
      status: 'COMPLETED'
    };
  } catch (error) {
    console.error('Error verifying PayPal payment:', error);
    return {
      success: false,
      verified: false,
      message: `Error verifying payment: ${error.message}`
    };
  }
};

module.exports = {
  verifyPayPalWebhookSignature,
  handlePayPalWebhook,
  verifyPayPalPayment
};
