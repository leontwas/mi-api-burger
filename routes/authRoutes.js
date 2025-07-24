const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta simulada de login
router.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  if (usuario === 'admin@gmail.com' && password === '123456') {
    const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

module.exports = router;
