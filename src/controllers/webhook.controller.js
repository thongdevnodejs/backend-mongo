const { 
  verifyPayPalWebhookSignature, 
  handlePayPalWebhook,
  verifyPayPalPayment
} = require('../services/webhook.service');
const { successResponse, errorResponse } = require('../utils/response');

class WebhookController {
  /**
   * Handle PayPal webhook events
   */
  async handlePayPalWebhook(req, res) {
    try {
      // Get the raw body and headers
      const event = req.body;
      const headers = req.headers;
      
      // Verify the webhook signature
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      const isValid = verifyPayPalWebhookSignature(headers, JSON.stringify(event), webhookId);
      
      if (!isValid) {
        return errorResponse(res, 'Invalid webhook signature', 401);
      }
      
      // Process the webhook event
      const result = await handlePayPalWebhook(event);
      
      return successResponse(res, result, 'Webhook processed successfully');
    } catch (error) {
      console.error('Error handling PayPal webhook:', error);
      return errorResponse(res, 'Failed to process webhook', 500, error);
    }
  }
  
  /**
   * Verify a PayPal payment
   */
  async verifyPayment(req, res) {
    try {
      const { orderId, payerId } = req.body;
      
      if (!orderId || !payerId) {
        return errorResponse(res, 'Order ID and Payer ID are required', 400);
      }
      
      const result = await verifyPayPalPayment(orderId, payerId);
      
      if (!result.verified) {
        return errorResponse(res, 'Payment verification failed', 400, { details: result });
      }
      
      return successResponse(res, result, 'Payment verified successfully');
    } catch (error) {
      console.error('Error verifying payment:', error);
      return errorResponse(res, 'Failed to verify payment', 500, error);
    }
  }
}

module.exports = new WebhookController();
