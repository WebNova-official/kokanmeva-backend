const mongoose = require("mongoose");

/* ================= ORDER ITEM ================= */

const orderItemSchema = new mongoose.Schema({
productId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product"
},

name:String,
buyPrice:Number,
sellPrice:Number,
quantity:Number,
total:Number
});


/* ================= ORDER ================= */

const orderSchema = new mongoose.Schema({

orderType:{
type:String,
default:"online" // online | manual
},

customer:{
name:String,
phone:String,
email:String,
address:String
},

items:[orderItemSchema],

subtotal:Number,
shipping:Number,
total:Number,

status:{
type:String,
default:"Pending"
},

createdAt:{
type:Date,
default:Date.now
}

});


module.exports = mongoose.model("Order", orderSchema);