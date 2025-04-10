const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pictureURL: {
    type: String,
    required: true
  },
  // Thêm tham chiếu đến các sản phẩm trong category
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;