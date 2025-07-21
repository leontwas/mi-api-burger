const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, '../data/productosMock.json');

const leerProductos = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    // Si el archivo está vacío pero existe, JSON.parse fallaría,
    // por eso un buen check para ver si el data tiene algo.
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe o está vacío (error de sintaxis en JSON), devuelve array vacío
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      console.warn('Advertencia: El archivo de productos no existe o está vacío/mal formado. Iniciando con un array vacío.');
      return [];
    }
    // Para otros errores de lectura, relanzar
    throw error;
  }
};

const guardarProductos = (productos) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error('Error al guardar productos:', error);
    // Podrías lanzar un error específico o manejarlo aquí de otra forma
    throw new Error('No se pudo guardar la información de los productos.');
  }
};

// GET /productos
exports.obtenerProductos = (req, res) => {
  try {
    const productos = leerProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.' });
  }
};

// GET /productos/:id
exports.obtenerProductoPorId = (req, res) => {
  try {
    const productos = leerProductos();
    const { id } = req.params; // Desestructuración para mayor claridad

    // Aseguramos que el ID sea un string para la comparación
    const producto = productos.find(p => String(p.id) === String(id));

    if (!producto) {
      return res.status(404).json({ error: `Producto con ID '${id}' no encontrado.` });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ error: 'Ocurrió un error al buscar el producto.' });
  }
};

// POST /productos
exports.crearProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const nuevoProducto = req.body;

    // --- Validación básica del nuevo producto ---
    if (!nuevoProducto || !nuevoProducto.nombre || typeof nuevoProducto.precio === 'undefined' || nuevoProducto.precio < 0) {
      return res.status(400).json({ error: 'Datos del producto incompletos o inválidos (requiere nombre y precio positivo).' });
    }

    // Si el ID viene en el body, se valida. Si no, se genera uno nuevo.
    if (nuevoProducto.id) {
      if (productos.some(p => String(p.id) === String(nuevoProducto.id))) {
        return res.status(400).json({ error: `El ID '${nuevoProducto.id}' ya existe.` });
      }
    } else {
      // Generar un ID simple para el mock (puedes usar librerías como 'uuid' para IDs únicos reales)
      nuevoProducto.id = Date.now(); // ID basado en timestamp
    }

    productos.push(nuevoProducto);
    guardarProductos(productos); // Esto ya tiene su propio try-catch interno
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    // Si el error viene de guardarProductos, lo mostramos adecuadamente
    const errorMessage = error.message.includes('No se pudo guardar') ? error.message : 'Ocurrió un error al crear el producto.';
    res.status(500).json({ error: errorMessage });
  }
};

// PUT /productos/:id
exports.actualizarProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const { id } = req.params;
    const index = productos.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: `Producto con ID '${id}' no encontrado para actualizar.` });
    }

    let productoExistente = productos[index];
    const { nombre, precio, descripcion } = req.body;

    // Validaciones y actualizaciones de campos
    if (nombre !== undefined) { // Permite actualizar a un string vacío si es deseado
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre debe ser una cadena de texto no vacía.' });
      }
      productoExistente.nombre = nombre;
    }
    if (precio !== undefined) {
      if (typeof precio !== 'number' || precio < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
      }
      productoExistente.precio = precio;
    }
    if (descripcion !== undefined) { // Permite actualizar a un string vacío si es deseado
      if (typeof descripcion !== 'string') {
        return res.status(400).json({ error: 'La descripción debe ser una cadena de texto.' });
      }
      productoExistente.descripcion = descripcion;
    }

    // No permitir cambiar el ID a través del body
    if (req.body.id && String(req.body.id) !== String(productoExistente.id)) {
      return res.status(400).json({ error: 'No se permite cambiar el ID de un producto existente.' });
    }

    productos[index] = productoExistente;
    guardarProductos(productos);
    res.json(productoExistente);

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    const errorMessage = error.message.includes('No se pudo guardar') ? error.message : 'Ocurrió un error interno al actualizar el producto.';
    res.status(500).json({ error: errorMessage });
  }
};

// DELETE /productos/:id
exports.eliminarProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const { id } = req.params;
    const nuevosProductos = productos.filter(p => String(p.id) !== String(id));

    if (nuevosProductos.length === productos.length) {
      return res.status(404).json({ error: `Producto con ID '${id}' no encontrado para eliminar.` });
    }

    guardarProductos(nuevosProductos);
    res.json({ mensaje: `Producto con ID '${id}' eliminado correctamente.` });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    const errorMessage = error.message.includes('No se pudo guardar') ? error.message : 'Ocurrió un error al eliminar el producto.';
    res.status(500).json({ error: errorMessage });
  }
};