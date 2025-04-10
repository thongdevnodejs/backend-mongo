const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pictureURL: {
    type: String,
    required: true
  },
  feature: [{
    type: String
  }],
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  amountInStore: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  // Thêm tham chiếu đến các đơn hàng chứa sản phẩm này
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  // Thêm tham chiếu đến giỏ hàng chứa sản phẩm này
  cartItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  }]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;