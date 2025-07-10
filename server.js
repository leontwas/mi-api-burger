const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const productosRoutes = require('./routes/productosRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir CORS
app.use(cors());

// Middleware para parsear JSON en body
app.use(express.json());

// Servir archivos estáticos (imágenes) desde la carpeta /public/images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api', authRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
