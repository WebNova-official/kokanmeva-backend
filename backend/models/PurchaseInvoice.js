const mongoose = require("mongoose");

const purchaseInvoiceSchema = new mongoose.Schema({

    vendorName: {
        type: String,
        required: true
    },

    billNumber: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            productName: String,

            quantity: Number,

            buyPrice: Number
        }
    ]

},{ timestamps:true });

module.exports = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);