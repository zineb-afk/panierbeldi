const Message = require('../models/Message');

const create = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    const msg = new Message({ name, email, subject, message });
    await msg.save();
    res.status(201).json({ message: 'Message envoyé avec succès !' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { create, getAll };