// src/controllers/productosControllers.js
const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, '../data/productosMock.json');

/**
 * Lee los productos del archivo JSON.
 * @returns {Array} Un array de productos.
 * @throws {Error} Si ocurre un error al leer o parsear el archivo.
 */
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
    // Si el archivo no existe (ENOENT) o está vacío/mal formado (SyntaxError), devuelve un array vacío
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      console.warn('Advertencia: El archivo de productos no existe o está vacío/mal formado. Iniciando con un array vacío.');
      return [];
    }
    // Para otros errores de lectura, relanzar el error
    throw error;
  }
};

/**
 * Guarda el array de productos en el archivo JSON.
 * @param {Array} productos - El array de productos a guardar.
 * @throws {Error} Si ocurre un error al escribir en el archivo.
 */
const guardarProductos = (productos) => {
  try {
    // Convierte el array a una cadena JSON con indentación de 2 espacios para mayor legibilidad
    fs.writeFileSync(DATA_PATH, JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error('Error al guardar productos:', error);
    // Lanza un error específico para que pueda ser capturado por el controlador de ruta
    throw new Error('No se pudo guardar la información de los productos.');
  }
};

/**
 * @desc Obtiene todos los productos o filtra por nombre.
 * @route GET /api/productos?nombre=:nombre
 * @access Public
 */
exports.obtenerProductos = (req, res) => {
  try {
    let productos = leerProductos();
    const { nombre } = req.query; // <--- Obtiene el parámetro de consulta 'nombre'

    if (nombre) {
      // <--- Si se proporciona un nombre, filtra los productos
      const nombreLower = nombre.toLowerCase();
      productos = productos.filter(p => p.nombre && p.nombre.toLowerCase().includes(nombreLower));
      
      // Si no se encuentra ningún producto con ese nombre, devuelve un 404
      if (productos.length === 0) {
        return res.status(404).json({ error: `No se encontraron productos con el nombre '${nombre}'.` });
      }
    }

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.' });
  }
};

/**
 * @desc Obtiene un producto por su ID.
 * @route GET /api/productos/:id
 * @access Public
 */
exports.obtenerProductoPorId = (req, res) => {
  try {
    const productos = leerProductos();
    const { id } = req.params; // Desestructura el ID de los parámetros de la URL

    // Aseguramos que el ID del producto y el ID de la solicitud sean strings para una comparación consistente
    const producto = productos.find(p => String(p.id) === String(id));

    if (!producto) {
      // Si el producto no se encuentra, devuelve un estado 404
      return res.status(404).json({ error: `Producto con ID '${id}' no encontrado.` });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ error: 'Ocurrió un error al buscar el producto.' });
  }
};

/**
 * @desc Crea un nuevo producto.
 * @route POST /api/productos
 * @access Private (requiere token)
 */
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
      nuevoProducto.id = String(Date.now()); // Convertir a String para consistencia
    }

    productos.push(nuevoProducto);
    guardarProductos(productos); // Esto ya tiene su propio try-catch interno
    res.status(201).json(nuevoProducto); // Devuelve el producto creado con estado 201 (Created)
  } catch (error) {
    console.error('Error al crear producto:', error);
    // Si el error viene de guardarProductos, lo mostramos adecuadamente
    const errorMessage = error.message.includes('No se pudo guardar') ? error.message : 'Ocurrió un error al crear el producto.';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc Actualiza un producto existente por su ID.
 * @route PUT /api/productos/:id
 * @access Private (requiere token)
 */
exports.actualizarProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const { id } = req.params;
    const index = productos.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: `Producto con ID '${id}' no encontrado para actualizar.` });
    }

    let productoExistente = productos[index];
    const updates = req.body; // Obtiene todas las actualizaciones del cuerpo de la solicitud

    // Itera sobre las propiedades en el cuerpo de la solicitud y actualiza el producto existente
    for (const key in updates) {
      if (key === 'id') { // No permitir cambiar el ID a través del body
        if (String(updates[key]) !== String(productoExistente.id)) {
          return res.status(400).json({ error: 'No se permite cambiar el ID de un producto existente.' });
        }
        continue; // Ignora el ID si es el mismo
      }

      const value = updates[key];

      if (value !== '' && value !== null && value !== undefined) {
        if (key === 'precio') {
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue) && numericValue > 0) {
            productoExistente[key] = numericValue; // Direct update
          } else {
            return res.status(400).json({ error: 'El precio debe ser un número positivo para modificar.' });
          }
        } else if (key === 'imagen' && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(value)) {
          return res.status(400).json({ error: 'La URL de la imagen debe ser un formato válido (JPG, PNG, GIF, WEBP).' });
        } else if (typeof value === 'string' && value.trim() === '') {
          continue;
        }
        else {
          productoExistente[key] = value; // Direct update
        }
      }
    }

    // Si no se proporcionaron campos para actualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    productos[index] = productoExistente; // Actualiza el producto en el array
    guardarProductos(productos); // Guarda el array actualizado
    res.json(productoExistente); // Devuelve el producto actualizado

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    const errorMessage = error.message.includes('No se pudo guardar') ? error.message : 'Ocurrió un error interno al actualizar el producto.';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc Elimina un producto por su ID.
 * @route DELETE /api/productos/:id
 * @access Private (requiere token)
 */
exports.eliminarProducto = (req, res) => {
  try {
    const productos = leerProductos();
    const { id } = req.params;
    // Filtra los productos, excluyendo el que tiene el ID proporcionado
    const nuevosProductos = productos.filter(p => String(p.id) !== String(id));

    // Si el tamaño del array no cambió, significa que el producto no fue encontrado
    if (nuevosProductos.length === productos.length) {
      return res.status(404).json({ error: `Producto con ID '${id}' no encontrado para eliminar.` });
    }

    guardarProductos(nuevosProductos); // Guarda el array sin el producto eliminado
    res.json({ mensaje: `Producto con ID '${id}' eliminado correctamente.` });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    const errorMessage = error.message.includes('No se pudo guardar') ? error.message : 'Ocurrió un error al eliminar el producto.';
    res.status(500).json({ error: errorMessage });
  }
};
