// API-BURGER/routes/productosRoutes.js
const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productosControllers');

// Cambié 'middleware' por 'middlewares' y agregué la extensión '.js'
const verificarToken = require('../middlewares/auth.js');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

module.exports = router;
