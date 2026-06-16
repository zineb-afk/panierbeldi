const Product = require('../models/Product');

// Produits par défaut si la DB est vide
const defaultProducts = [
  { name:'Oeufs Beldi', price:35, cat:'Épicerie', emoji:'🥚', bg:'#F5EDD6', stock:120, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.9 },
  { name:'Miel Marouna', price:85, cat:'Bio', emoji:'🍯', bg:'#FFF8E7', stock:45, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:5.0 },
  { name:"Huile d'Olive", price:120, cat:'Bio', emoji:'🫒', bg:'#E8F0D8', stock:30, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:4.8 },
  { name:'Beurre Beldi', price:55, cat:'Laitier', emoji:'🧈', bg:'#FFFBEA', stock:60, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.7 },
  { name:'Savon Beldi', price:25, cat:'Épicerie', emoji:'🧼', bg:'#F0E8FA', stock:200, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.6 },
  { name:'Eau de Rose', price:45, cat:'Bio', emoji:'🌹', bg:'#FCE4EC', stock:80, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:4.9 },
  { name:'Harissa', price:25, cat:'Épicerie', emoji:'🌶️', bg:'#FFF0E8', stock:150, badge:'BELDI', seller:'Ferme El Hayouni, Fès', rating:4.6 },
  { name:'Fraises', price:18, cat:'Fruits', emoji:'🍓', bg:'#FDEAEA', stock:40, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:4.9 },
  { name:'Oranges', price:20, cat:'Fruits', emoji:'🍊', bg:'#FFF0E0', stock:200, badge:'BIO', seller:'Ferme El Hayouni, Fès', rating:5.0 },
];

const seedIfEmpty = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(defaultProducts);
    console.log('Products seeded');
  }
};

const getAll = async (req, res) => {
  try {
    await seedIfEmpty();
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
const create = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Erreur mise à jour', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur suppression', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
