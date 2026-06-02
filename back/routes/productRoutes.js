const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/productController');

router.get('/seed', async (req, res) => {
  const Product = require('../models/Product');
  await Product.deleteMany({});
  const defaultProducts = [
    { name:'Oeufs Beldi', price:35, cat:'Épicerie', emoji:'🥚', bg:'#F5EDD6', stock:120, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.9, saison:null, image:'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80' },
    { name:'Miel Marouna', price:85, cat:'Bio', emoji:'🍯', bg:'#FFF8E7', stock:45, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:5.0, saison:null, image:'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80' },
    { name:"Huile d'Olive", price:120, cat:'Bio', emoji:'🫒', bg:'#E8F0D8', stock:30, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:4.8, saison:null, image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
    { name:'Beurre Beldi', price:55, cat:'Laitier', emoji:'🧈', bg:'#FFFBEA', stock:60, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.7, saison:null, image:'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
    { name:'Savon Beldi', price:25, cat:'Épicerie', emoji:'🧼', bg:'#F0E8FA', stock:200, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.6, saison:null, image:'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
    { name:'Harissa', price:25, cat:'Épicerie', emoji:'🌶️', bg:'#FFF0E8', stock:150, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.6, saison:null, image:'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&q=80' },
    { name:'Fraises', price:18, cat:'Fruits', emoji:'🍓', bg:'#FDEAEA', stock:40, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:4.9, saison:'Printemps', image:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80' },
    { name:'Cerises', price:30, cat:'Fruits', emoji:'🍒', bg:'#FCEAEA', stock:35, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:5.0, saison:'Printemps', image:'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400&q=80' },
    { name:'Pastèque Beldi', price:15, cat:'Fruits', emoji:'🍉', bg:'#EDFAE8', stock:80, badge:'BELDI', seller:'Ferme El Hayouni, Sefrou', rating:4.7, saison:'Été', image:'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&q=80' },
    { name:'Pomme', price:28, cat:'Fruits', emoji:'🍎', bg:'#FCE8E8', stock:90, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:4.9, saison:'Automne', image:'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80' },
    { name:'Raisins', price:25, cat:'Fruits', emoji:'🍇', bg:'#F0E8FC', stock:60, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:4.8, saison:'Automne', image:'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80' },
    { name:'Oranges', price:20, cat:'Fruits', emoji:'🍊', bg:'#FFF0E0', stock:200, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:5.0, saison:'Hiver', image:'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&q=80' },
    { name:'Clémentines', price:22, cat:'Fruits', emoji:'🍋', bg:'#FFFAE0', stock:150, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:4.8, saison:'Hiver', image:'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80' },
    { name:'Pêche', price:22, cat:'Fruits', emoji:'🍑', bg:'#EDE8F5', stock:50, badge:'BIO', seller:'Ferme El Hayouni, Sefrou', rating:4.8, saison:'Été', image:'https://images.pexels.com/photos/1028599/pexels-photo-1028599.jpeg?w=400' },
    { name:'Eau de Rose', price:45, cat:'Bio', emoji:'🌹', bg:'#FCE4EC', stock:80, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:4.9, saison:null, image:'https://images.pexels.com/photos/6621461/pexels-photo-6621461.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];
  await Product.insertMany(defaultProducts);
  res.json({ message: '✅ Produits seedés avec photos !', count: defaultProducts.length });
});

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;