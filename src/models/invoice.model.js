const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    billingAddress: {
      type: String,
    },
    paymentStatus: {
      type: String,
      required: true,
      default: "unpaid",
      enum: ["unpaid", "paid", "failed"],
    },
    // Thêm thông tin thanh toán
    paymentDetails: {
      paymentMethod: String,
      transactionId: String,
      paymentDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
