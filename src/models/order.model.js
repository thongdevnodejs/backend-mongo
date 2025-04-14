const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed']
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  postalCode: String,
  country: String,
  phone: String
});

const paymentDetailsSchema = new mongoose.Schema({
  id: String,
  status: String,
  paymentMethod: {
    type: String,
    default: 'PayPal'
  },
  payerEmail: String,
  createTime: Date,
  updateTime: Date
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed']
  },
  // Thêm tham chiếu đến các items trong đơn hàng
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  // Thêm tham chiếu đến invoice
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  // Thêm các trường mới
  statusHistory: [statusHistorySchema],
  shippingAddress: shippingAddressSchema,
  paymentDetails: paymentDetailsSchema,
  trackingNumber: String,
  carrier: String,
  estimatedDeliveryDate: Date,
  notes: String,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;