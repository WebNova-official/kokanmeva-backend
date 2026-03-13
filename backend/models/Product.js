const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

  category: {
  type: String,
  enum: ["sharbats", "pickles", "flours", "snacks"],
  required: true
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

    totalStock: {
        type: Number,
        default: 0,
        min: 0
    },

    description: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["public", "hidden"],
        default: "public"
    }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);