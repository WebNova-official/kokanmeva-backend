const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ==========================================================
   ENSURE UPLOADS FOLDER EXISTS (IMPORTANT FIX)
========================================================== */
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* ==========================================================
   MULTER CONFIG (SECURE IMAGE UPLOAD)
========================================================== */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, WEBP allowed"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
});

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
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

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
            if (!req.file) {
    return res.status(400).json({
        success: false,
        message: "Image is required"
    });
}

image: req.file.filename
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

        // Delete old image if new uploaded
        if (req.file && product.image) {
            const oldPath = path.join(uploadDir, product.image);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
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

            status: req.body.status || product.status
        };

        if (req.file) {
            updatedData.image = req.file.filename;
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

        if (product.image) {
            const imagePath = path.join(uploadDir, product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

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
