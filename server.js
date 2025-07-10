const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productosRoutes = require('./routes/productosRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
