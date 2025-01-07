const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gramax_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de login utilizando DPI y contraseña
app.post('/login', (req, res) => {
  const { dpi, contrasena } = req.body;

  const query = `SELECT * FROM usuarios WHERE dpi = ?`;

  db.query(query, [dpi], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'DPI no encontrado' });
    }

    const user = results[0];

    if (user.contrasena_original === contrasena) {
      return res.json({
        message: 'Inicio de sesión exitoso',
        rol: user.rol,
        token: 'FAKE_TOKEN',
      });
    } else {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
  });
});

// Obtener todos los usuarios (READ)
app.get('/users', (req, res) => {
  const query = `
    SELECT id, rol, correo_electronico, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, contrasena_original 
    FROM usuarios
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuarios' });
    res.json(results);
  });
});

// Crear un nuevo usuario (CREATE)
app.post('/register', (req, res) => {
  const { rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi } = req.body;

  if (!rol || !correo_electronico || !contrasena_original || !correo_sat || !nit || !dpi || !contrasena_correo || !contrasena_sat) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const query = `
    INSERT INTO usuarios (rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi],
    (err, result) => {
      if (err) {
        console.error('Error al insertar el usuario:', err);
        return res.status(500).json({ message: 'Error al registrar usuario' });
      }
      res.status(201).json({ message: 'Usuario creado exitosamente' });
    }
  );
});

// Actualizar un usuario (UPDATE)
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi } = req.body;

  const updateQuery = `
    UPDATE usuarios 
    SET rol = ?, correo_electronico = ?, contrasena_original = ?, contrasena_correo = ?, contrasena_sat = ?, correo_sat = ?, nit = ?, dpi = ?
    WHERE id = ?
  `;
  db.query(
    updateQuery,
    [rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, id],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ message: 'Error al actualizar usuario' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario actualizado exitosamente' });
    }
  );
});

// Eliminar un usuario (DELETE)
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM usuarios WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar usuario', error: err });
    res.json({ message: 'Usuario eliminado correctamente' });
  });
});

// Endpoint para obtener datos de cliente por DPI
app.get('/user/:dpi', (req, res) => {
  const { dpi } = req.params;
  console.log('DPI recibido:', dpi); // Depuración

  const query = `SELECT correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, dpi FROM usuarios WHERE dpi = ?`;

  db.query(query, [dpi], (err, results) => {
    if (err) {
      console.error('Error al obtener datos del usuario:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
});

// Escuchar en el puerto configurado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
