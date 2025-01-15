const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

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

// Endpoint para obtener un usuario por DPI
app.get('/user/:dpi', (req, res) => {
  const { dpi } = req.params;

  const query = `
    SELECT correo_electronico, contrasena_original, contrasena_correo, 
           contrasena_sat, correo_sat, nit, tramite, dpi 
    FROM usuarios 
    WHERE dpi = ?
  `;

  db.query(query, [dpi], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario por DPI:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
});

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
    SELECT id, rol, correo_electronico, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, contrasena_original, tramite
    FROM usuarios
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuarios' });
    res.json(results);
  });
});

// Crear un nuevo usuario (CREATE)
app.post('/register', (req, res) => {
  const { rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, tramite } = req.body;

  if (!rol || !correo_electronico || !contrasena_original || !tramite || !nit || !dpi || !contrasena_correo || !contrasena_sat) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const query = `
    INSERT INTO usuarios (rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, tramite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, tramite],
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
  const { rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, tramite } = req.body;

  const updateQuery = `
    UPDATE usuarios 
    SET rol = ?, correo_electronico = ?, contrasena_original = ?, contrasena_correo = ?, contrasena_sat = ?, correo_sat = ?, nit = ?, dpi = ?, tramite = ?
    WHERE id = ?
  `;
  db.query(
    updateQuery,
    [rol, correo_electronico, contrasena_original, contrasena_correo, contrasena_sat, correo_sat, nit, dpi, tramite, id],
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

// CRUD de Trámites
// Crear un nuevo trámite
app.post('/tramite', (req, res) => {
  const { userId, tipo } = req.body;

  if (!userId || !tipo) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const query = `
    INSERT INTO tramites (user_id, tipo)
    VALUES (?, ?)
  `;

  db.query(query, [userId, tipo], (err, result) => {
    if (err) {
      console.error('Error al crear el trámite:', err);
      return res.status(500).json({ message: 'Error al registrar el trámite' });
    }
    res.status(201).json({ message: 'Trámite creado exitosamente' });
  });
});

// Obtener trámites por usuario
app.get('/tramites/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT id, tipo, fecha_creacion
    FROM tramites
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener trámites:', err);
      return res.status(500).json({ message: 'Error al obtener trámites' });
    }

    res.json(results);
  });
});

// Actualizar un trámite
app.put('/tramite/:id', (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  const query = `
    UPDATE tramites
    SET tipo = ?
    WHERE id = ?
  `;

  db.query(query, [tipo, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el trámite:', err);
      return res.status(500).json({ message: 'Error al actualizar el trámite' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Trámite no encontrado' });
    }

    res.json({ message: 'Trámite actualizado exitosamente' });
  });
});

// Eliminar un trámite
app.delete('/tramite/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM tramites WHERE id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar el trámite:', err);
      return res.status(500).json({ message: 'Error al eliminar el trámite' });
    }

    res.json({ message: 'Trámite eliminado correctamente' });
  });
});

// Escuchar en el puerto configurado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
app.get('/reportes', (req, res) => {
  const reportData = {
    nitCount: 150, // Total de NIT
    agenciaVirtualCount: 200, // Total de Agencia Virtual
    weeklyData: [
      { week: 'Semana 1', nit: 30, agencia: 50 },
      { week: 'Semana 2', nit: 40, agencia: 60 },
      { week: 'Semana 3', nit: 50, agencia: 70 },
      { week: 'Semana 4', nit: 30, agencia: 20 },
    ],
  };
  res.json(reportData);
});
