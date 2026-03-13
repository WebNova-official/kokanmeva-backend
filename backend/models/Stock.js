const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  supplierName: {
    type: String,
    required: true,
    trim: true
  },

  invoiceNumber: {
    type: String,
    default: ""
  },

  quantityPurchased: {
    type: Number,
    required: true,
    min: 1
  },

  buyPrice: {
    type: Number,
    required: true,
    min: 0
  },

  sellPrice: {
    type: Number,
    required: true,
    min: 0
  },

  totalPurchaseCost: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("Stock", stockSchema);