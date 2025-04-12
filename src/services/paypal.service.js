const { loadScript } = require('@paypal/paypal-js');

class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.isSandbox = process.env.PAYPAL_ENVIRONMENT === 'sandbox';
  }

  /**
   * Initialize PayPal SDK
   * @returns {Promise<Object>} PayPal SDK instance
   */
  async initialize() {
    try {
      return await loadScript({
        'client-id': this.clientId,
        'data-namespace': 'paypalSDK',
        'enable-funding': 'paylater,venmo,card',
        'disable-funding': 'credit',
        'currency': 'USD',
        'intent': 'capture'
      });
    } catch (error) {
      console.error('Failed to load the PayPal JS SDK script', error);
      throw new Error(`PayPal SDK initialization error: ${error.message}`);
    }
  }

  /**
   * Create a PayPal order
   * @param {Array} items - Cart items
   * @param {Number} totalAmount - Total amount
   * @returns {Promise<Object>} PayPal order
   */
  async createOrder(items, totalAmount) {
    try {
      const paypal = await this.initialize();
      
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: totalAmount.toFixed(2)
                }
              }
            },
            items: items.map(item => ({
              name: item.name,
              unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2)
              },
              quantity: item.quantity
            }))
          }
        ],
        application_context: {
          brand_name: 'Your Store Name',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        }
      };

      return await paypal.createOrder(orderData);
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new Error(`Error creating PayPal order: ${error.message}`);
    }
  }

  /**
   * Capture a PayPal payment
   * @param {String} orderId - PayPal order ID
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(orderId) {
    try {
      const paypal = await this.initialize();
      return await paypal.captureOrder(orderId);
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw new Error(`Error capturing PayPal payment: ${error.message}`);
    }
  }

  /**
   * Get PayPal order details
   * @param {String} orderId - PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const paypal = await this.initialize();
      return await paypal.getOrderDetails(orderId);
    } catch (error) {
      console.error('Error getting PayPal order details:', error);
      throw new Error(`Error getting PayPal order details: ${error.message}`);
    }
  }

  /**
   * Handle PayPal webhook events
   * @param {Object} event - PayPal webhook event
   * @returns {Object} Processed event result
   */
  async handleWebhookEvent(event) {
    try {
      // Verify webhook signature if needed
      
      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          // Payment was captured successfully
          return {
            success: true,
            event: event.event_type,
            orderId: event.resource.id,
            data: event.resource
          };
        
        case 'PAYMENT.CAPTURE.DENIED':
          // Payment was denied
          return {
            success: false,
            event: event.event_type,
            orderId: event.resource.id,
            data: event.resource
          };
          
        case 'PAYMENT.CAPTURE.PENDING':
          // Payment is pending
          return {
            success: true,
            pending: true,
            event: event.event_type,
            orderId: event.resource.id,
            data: event.resource
          };
          
        default:
          return {
            success: true,
            event: 'unhandled_event',
            eventType: event.event_type,
            data: event
          };
      }
    } catch (error) {
      console.error('Error handling PayPal webhook event:', error);
      throw new Error(`Error handling PayPal webhook event: ${error.message}`);
    }
  }
}

module.exports = new PayPalService();
