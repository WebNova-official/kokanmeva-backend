const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const Order = require("../models/Order");
const Product = require("../models/Product");

const sendInvoice = require("../utils/sendInvoice");
const sendAdminNotification = require("../utils/sendAdminNotification");


/* =========================================
   RAZORPAY INSTANCE
========================================= */

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});


/* =========================================
   ADMIN PANEL - MANUAL ORDER
========================================= */

router.post("/add", async (req,res)=>{

try{

let items = [];
let total = 0;

for(const i of req.body.items){

const product = await Product.findOne({ name:i.name });

if(!product){
return res.status(400).json({
success:false,
message:"Product not found"
});
}

if(product.totalStock < i.qty){
return res.status(400).json({
success:false,
message:`${product.name} out of stock`
});
}

/* deduct stock */
await Product.findByIdAndUpdate(
product._id,
{ $inc:{ totalStock:-i.qty } }
);

const itemTotal = i.price * i.qty;

total += itemTotal;

items.push({

productId:product._id,
name:product.name,
buyPrice:product.buyPrice || 0,
sellPrice:i.price,
quantity:i.qty,
total:itemTotal

});

}

const order = new Order({

orderType:"manual",

customer:{
name:req.body.name || "Walk-in",
phone:req.body.phone || "",
email:"",
address:req.body.address || ""
},

items:items,

subtotal:total,
shipping:0,
total:total,

status:"Paid"

});

await order.save();

res.json({
success:true,
message:"Manual order created"
});

}catch(err){

console.error("Manual order error:",err);

res.status(500).json({
success:false,
message:"Order failed"
});

}

});


/* =======================================================
   CREATE ORDER (WEBSITE CHECKOUT)
======================================================= */

router.post("/create", async (req,res)=>{

try{

const { total, items } = req.body;

if(!total || !items || items.length===0){

return res.status(400).json({
success:false,
error:"Invalid order data"
});

}

for(let item of items){

const product = await Product.findById(item.productId);

if(!product){
return res.status(400).json({
success:false,
error:"Product not found"
});
}

if(product.totalStock < item.quantity){
return res.status(400).json({
success:false,
error:`${product.name} out of stock`
});
}

}

const razorpayOrder = await razorpay.orders.create({

amount:Math.round(total * 100),
currency:"INR",
receipt:"receipt_" + Date.now()

});

res.json({
success:true,
order:razorpayOrder,
key:process.env.RAZORPAY_KEY_ID
});

}catch(err){

console.error("Create Order Error:", err);

res.status(500).json({
success:false,
error: err.message
});
}

});


/* =======================================================
   VERIFY PAYMENT
======================================================= */

router.post("/verify", async (req,res)=>{

try{

const {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature,
customer,
items,
subtotal,
shipping,
total
} = req.body;

const generated_signature = crypto
.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
.update(`${razorpay_order_id}|${razorpay_payment_id}`)
.digest("hex");

if(generated_signature !== razorpay_signature){

return res.status(400).json({
success:false,
message:"Payment verification failed"
});

}

let finalItems = [];

for(let item of items){

const product = await Product.findById(item.productId);

if(!product){
return res.status(400).json({
success:false,
message:"Product not found"
});
}

if(product.totalStock < item.quantity){
return res.status(400).json({
success:false,
message:`${product.name} out of stock`
});
}

/* deduct stock */
await Product.findByIdAndUpdate(
item.productId,
{ $inc:{ totalStock:-item.quantity } }
);

finalItems.push({

productId:product._id,
name:product.name,
buyPrice:product.buyPrice || 0,
sellPrice:product.sellPrice,
quantity:item.quantity,
total:product.sellPrice * item.quantity

});

}

const newOrder = new Order({

orderType:"online",

paymentId:razorpay_payment_id,
orderId:razorpay_order_id,
signature:razorpay_signature,

customer,

items:finalItems,

subtotal,
shipping,
total,

status:"Paid"

});

await newOrder.save();

sendInvoice(newOrder).catch(console.error);
sendAdminNotification(newOrder).catch(console.error);

res.json({
success:true,
message:"Payment verified & order saved"
});

}catch(err){

console.error("Verify Error:",err);

res.status(500).json({
success:false,
message:"Internal Server Error"
});

}

});


/* =========================================
   GET ALL ORDERS
========================================= */

router.get("/all", async (req,res)=>{

try{

const orders = await Order.find().sort({createdAt:-1});

res.json(orders);

}catch(err){

console.error(err);

res.status(500).json({
error:"Failed to fetch orders"
});

}

});


/* =========================================
   UPDATE ORDER STATUS
========================================= */

router.put("/update-status/:id", async (req,res)=>{

try{

const updatedOrder = await Order.findByIdAndUpdate(

req.params.id,
{ status:req.body.status },
{ new:true }

);

res.json(updatedOrder);

}catch(err){

res.status(500).json({
error:"Status update failed"
});

}

});


/* =========================================
   CANCEL ORDER
========================================= */

router.put("/cancel/:id", async (req,res)=>{

try{

const order = await Order.findById(req.params.id);

for(let item of order.items){

await Product.findByIdAndUpdate(

item.productId,
{ $inc:{ totalStock:item.quantity } }

);

}

order.status="Cancelled";

await order.save();

res.json({success:true});

}catch(err){

res.status(500).json({
error:"Cancel failed"
});

}

});


module.exports = router;