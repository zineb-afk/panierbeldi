const Order = require('../models/Order');

const getAll = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const orderId = '#CMD-' + Math.floor(1000 + Math.random() * 9000);
    const order = new Order({ ...req.body, orderId });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création', error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Erreur mise à jour', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commande supprimée' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur suppression', error: err.message });
  }
};

module.exports = { getAll, create, updateStatus, remove };
