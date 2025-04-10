const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Error creating payment intent: ${error.message}`);
    }
  }

  // Create checkout session
  async createCheckoutSession(items, successUrl, cancelUrl) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return session;
    } catch (error) {
      throw new Error(`Error creating checkout session: ${error.message}`);
    }
  }

  // Handle webhook event
  async handleWebhookEvent(signature, payload) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          return { success: true, event: event.type };
        case 'payment_intent.payment_failed':
          // Handle failed payment
          return { success: false, event: event.type };
        default:
          return { success: true, event: 'unhandled_event' };
      }
    } catch (error) {
      throw new Error(`Error handling webhook event: ${error.message}`);
    }
  }

  // Get payment details
  async getPaymentDetails(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Error getting payment details: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
