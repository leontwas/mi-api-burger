const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, '../data/productosMock.json');

const leerProductos = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe o está vacío, devuelve array vacío
    if (error.code === 'ENOENT') return [];
    throw error; // otros errores sí los lanza
  }
};

const guardarProductos = (productos) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(productos, null, 2));
};

// GET /productos
exports.obtenerProductos = (req, res) => {
  try {
    const productos = leerProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error al leer productos:', error);
    res.status(500).json({ error: 'Error al leer productos' });
  }
};

// GET /productos/:id
exports.obtenerProductoPorId = (req, res) => {
  try {
    const productos = leerProductos();
    // Convierte id a string para comparación segura
    const producto = productos.find(p => String(p.id) === String(req.params.id));
    if (!producto) return res.status(404).json({ error: 'No encontrado' });
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// POST /productos
exports.crearProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const nuevo = req.body;

    // Puedes validar que nuevo tenga id único, por ejemplo:
    if (productos.some(p => String(p.id) === String(nuevo.id))) {
      return res.status(400).json({ error: 'El ID ya existe' });
    }

    productos.push(nuevo);
    guardarProductos(productos);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT /productos/:id
exports.actualizarProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const index = productos.findIndex(p => String(p.id) === String(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'No encontrado' });

    productos[index] = { ...productos[index], ...req.body };
    guardarProductos(productos);
    res.json(productos[index]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE /productos/:id
exports.eliminarProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const nuevos = productos.filter(p => String(p.id) !== String(req.params.id));
    if (nuevos.length === productos.length) return res.status(404).json({ error: 'No encontrado' });

    guardarProductos(nuevos);
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
