const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* ==========================================================
   CLOUDINARY CONFIG
========================================================== */
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

/* ==========================================================
   MULTER + CLOUDINARY STORAGE
========================================================== */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "kokan-meva",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
});

const upload = multer({ storage });

/* ==========================================================
   GET ALL PRODUCTS
========================================================== */
router.get("/all", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================
   ADD NEW PRODUCT
========================================================== */
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const {
            name,
            buyPrice,
            sellPrice,
            totalStock,
            category,
            description,
            status
        } = req.body;

        // Validation
        if (!name || buyPrice === undefined || sellPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, Buy Price and Sell Price are required"
            });
        }

        if (Number(sellPrice) < Number(buyPrice)) {
            return res.status(400).json({
                success: false,
                message: "Sell price cannot be less than buy price"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Product image is required"
            });
        }

        const newProduct = new Product({
            name: name.trim(),
            category: category || "General",
            buyPrice: Number(buyPrice),
            sellPrice: Number(sellPrice),
            totalStock: Number(totalStock) || 0,
            description: description || "",
            status: status || "public",
            image: req.file.path, // ✅ Cloudinary URL
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });

    } catch (err) {
        console.error("Add Product Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================
   UPDATE PRODUCT
========================================================== */
router.put("/update/:id", upload.single("image"), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Price validation
        if (
            req.body.buyPrice !== undefined &&
            req.body.sellPrice !== undefined &&
            Number(req.body.sellPrice) < Number(req.body.buyPrice)
        ) {
            return res.status(400).json({
                success: false,
                message: "Sell price cannot be less than buy price"
            });
        }

        const updatedData = {
            name: req.body.name || product.name,
            category: req.body.category || product.category,
            description: req.body.description || product.description,

            buyPrice:
                req.body.buyPrice !== undefined
                    ? Number(req.body.buyPrice)
                    : product.buyPrice,

            sellPrice:
                req.body.sellPrice !== undefined
                    ? Number(req.body.sellPrice)
                    : product.sellPrice,

            totalStock:
                req.body.totalStock !== undefined
                    ? Number(req.body.totalStock)
                    : product.totalStock,

            status: req.body.status || product.status,
        };

        // ✅ If new image uploaded → replace
        if (req.file) {
            updatedData.image = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        res.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (err) {
        console.error("Update Product Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================
   DELETE PRODUCT
========================================================== */
router.delete("/delete/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // ❌ No local delete needed (Cloudinary handles storage)

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (err) {
        console.error("Delete Product Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
