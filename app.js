// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productosRoutes from './routes/productosRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);

app.listen(3000, () => {
  console.log('Servidor API corriendo en http://localhost:3000');
});
