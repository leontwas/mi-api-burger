import express from 'express';
import { verificarToken } from '../middlewares/auth.js';
import productos from '../data/productosMock.json';

const router = express.Router();

router.get('/', verificarToken, (req, res) => {
  res.json(productos);
});

export default router;
