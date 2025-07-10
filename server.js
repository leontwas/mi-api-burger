const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const productosRoutes = require('./routes/productosRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware CORS
app.use(cors());
app.use(express.json());

// ✅ Servir imágenes estáticas desde /images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ✅ Rutas API
app.use('/api/productos', productosRoutes);
app.use('/api', authRoutes);

// ✅ Ruta fallback para 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
