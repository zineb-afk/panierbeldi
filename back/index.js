const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const connectDb = require('./config/connectDb');

const userRoutes    = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.send('Panier Beldi API ✅'));

app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => console.log('Server running on port ' + port));
  } catch (error) {
    console.error('Failed to start server');
    process.exit(1);
  }
};

startServer();
