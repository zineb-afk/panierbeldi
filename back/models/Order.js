const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId:  { type: String, required: true, unique: true },
  customer: {
    fullName: String,
    phone:    String,
    city:     String,
    address:  String,
    email:    String,
  },
  items: [{
    id:     { type: mongoose.Schema.Types.Mixed },
    name:   String,
    price:  Number,
    qty:    Number,
    emoji:  String,
    seller: String,
  }],
  total:   { type: Number, required: true },
  payment: { type: String, default: 'cash' },
  status:  { type: String, default: 'confirmed', enum: ['confirmed','preparing','on_road','delivered','cancelled'] },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);