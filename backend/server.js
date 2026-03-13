const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express(); // ✅ CREATE APP FIRST

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- MONGODB CONNECTION ---------------- */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err.message));

/* ---------------- ROUTES ---------------- */
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

// Existing
const stockRoutes = require("./routes/stockRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

// Main APIs
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchase", purchaseRoutes);

// Extra APIs
app.use("/api/stock", stockRoutes);
app.use("/api/expense", expenseRoutes);

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
    res.send("✅ Backend Running");
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});