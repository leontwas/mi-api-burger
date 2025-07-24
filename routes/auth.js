//auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/login', (req, res) => {
  const { usuario, contraseña } = req.body;

  // Validación muy básica. Ideal: usar base de datos y bcrypt.
  if (usuario === 'admin@gmail.com' && contraseña === '123456') {
    const token = jwt.sign({ usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ mensaje: 'Credenciales incorrectas' });
});

export default router;
