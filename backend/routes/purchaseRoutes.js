const express = require("express");
const router = express.Router();

const Purchase = require("../models/Purchase");
const Product = require("../models/Product");


/* ======================================
ADD PURCHASE BILL
====================================== */

router.post("/add", async (req,res)=>{

try{

let items = [];
let total = 0;

for(const item of req.body.items){

const product = await Product.findById(item.productId);

if(!product){
return res.status(400).json({
success:false,
message:"Product not found"
});
}

const itemTotal = item.qty * item.price;

total += itemTotal;

items.push({

productId:product._id,
name:product.name,
quantity:item.qty,
buyPrice:item.price,
total:itemTotal

});

/* increase stock */

await Product.findByIdAndUpdate(

product._id,

{ $inc:{ totalStock:item.qty } }

);

}

const purchase = new Purchase({

supplier:req.body.supplier,
billNumber:req.body.billNumber,
items:items,
total:total

});

await purchase.save();

res.json({

success:true,
message:"Purchase saved"

});

}catch(err){

console.error(err);

res.status(500).json({

success:false,
message:"Purchase failed"

});

}

});


/* ======================================
GET PURCHASE HISTORY
====================================== */

router.get("/all", async (req,res)=>{

try{

const purchases = await Purchase.find()
.sort({createdAt:-1});

res.json(purchases);

}catch(err){

res.status(500).json({
error:"Failed to load purchases"
});

}

});


module.exports = router;