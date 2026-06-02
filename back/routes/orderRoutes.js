const express = require('express');
const router = express.Router();
const { getAll, create, updateStatus, remove } = require('../controllers/orderController');

router.get('/', getAll);
router.post('/', create);
router.put('/:id/status', updateStatus);
router.delete('/:id', remove);
router.get('/fix', async (req, res) => {
  try {
    const Order = require('../models/Order');
    await Order.collection.dropIndexes();
    res.json({ message: '✅ Index supprimés !' });
  } catch(e) {
    res.json({ message: 'OK', error: e.message });
  }
});

module.exports = router;
