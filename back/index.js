const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

const connectDb = require('./config/connectDb');

const userRoutes    = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/messages', messageRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

app.get('/', (req, res) => res.send('Panier Beldi API ✅'));

// Connexion MongoDB une seule fois
connectDb().catch(err => console.error('MongoDB connection error:', err));

// ✅ Export pour Vercel (serverless)
module.exports = app;

// ✅ Listen uniquement en local (pas sur Vercel)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('Server running on port ' + port));
}