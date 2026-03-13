const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({

productId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product"
},

name:String,

quantity:Number,

buyPrice:Number,

total:Number

});


const purchaseSchema = new mongoose.Schema({

supplier:String,

billNumber:String,

items:[purchaseItemSchema],

total:Number,

createdAt:{
type:Date,
default:Date.now
}

});


module.exports = mongoose.model("Purchase", purchaseSchema);