const mongoose = require("mongoose");

const purchaseBatchSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    productName: String,

    supplier: String,

    buyPrice: {
        type: Number,
        required: true
    },

    quantityPurchased: {
        type: Number,
        required: true
    },

    quantityRemaining: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("PurchaseBatch", purchaseBatchSchema);