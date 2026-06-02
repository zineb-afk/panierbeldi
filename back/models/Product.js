const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  price:  { type: Number, required: true },
  cat:    { type: String, default: 'Épicerie' },
  emoji:  { type: String, default: '📦' },
  bg:     { type: String, default: '#F5EDD6' },
  stock:  { type: Number, default: 0 },
  badge:  { type: String, default: 'BELDI' },
  seller: { type: String, default: 'Ferme El Hayouni, Fès' },
  rating: { type: Number, default: 4.8 },
  active: { type: Boolean, default: true },
  saison: { type: String, enum: ['Printemps', 'Été', 'Automne', 'Hiver'] },
  image: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);