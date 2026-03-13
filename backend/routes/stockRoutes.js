const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const Product = require("../models/Product");

/* ==========================================================
   ADD STOCK (INCREASE PRODUCT STOCK)
========================================================== */
router.post("/add", async (req, res) => {
  try {

    const {
      productId,
      supplierName,
      invoiceNumber,
      quantityPurchased,
      buyPrice,
      sellPrice
    } = req.body;

    if (!productId || !supplierName || !quantityPurchased || !buyPrice || !sellPrice) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const qty = Number(quantityPurchased);

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    /* 🔥 INCREASE PRODUCT STOCK */
    product.stock += qty;

    /* 🔥 OPTIONALLY UPDATE BUY/SELL PRICE */
    product.buyPrice = Number(buyPrice);
    product.sellPrice = Number(sellPrice);

    await product.save();

    const newStock = new Stock({
      product: productId,
      supplierName,
      invoiceNumber,
      quantityPurchased: qty,
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      totalPurchaseCost: qty * Number(buyPrice)
    });

    await newStock.save();

    res.json({
      success: true,
      message: "Stock added & product inventory updated"
    });

  } catch (err) {
    console.error("Add Stock Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ==========================================================
   GET ALL STOCK (WITH PRODUCT DETAILS)
========================================================== */
router.get("/all", async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate("product", "name category stock")
      .sort({ createdAt: -1 });

    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   REDUCE STOCK MANUALLY (SAFE)
========================================================== */
router.put("/reduce/:productId", async (req, res) => {
  try {

    const qty = Number(req.body.quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity required"
      });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.productId, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock"
      });
    }

    res.json({
      success: true,
      message: "Stock reduced successfully",
      newStock: updatedProduct.stock
    });

  } catch (err) {
    console.error("Reduce Stock Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ==========================================================
   GET SUPPLIER REPORT
========================================================== */
router.get("/supplier/:name", async (req, res) => {
  try {
    const report = await Stock.find({
      supplierName: req.params.name
    }).populate("product", "name");

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   DELETE STOCK RECORD
========================================================== */
router.delete("/delete/:id", async (req, res) => {
  try {

    await Stock.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Stock record deleted"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;