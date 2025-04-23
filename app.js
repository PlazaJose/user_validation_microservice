const express = require('express');
const { sha512, sha384, sha512_256, sha512_224 } = require('js-sha512');
const db = require('./db');
const app = express();
const port = 5101;

// Middleware to parse JSON
app.use(express.json());

// Route to validate user
app.get('/validar/:id/:pas', (req, res) => {
  const { id, pas } = req.params;
  
  // Hash the password using SHA-512 (same as in your Python code)
  //const hash_pas = crypto.createHash('sha512').update(pas).digest('hex');
  console.log("contraseña: ", pas);
  const hash_pas = sha512(pas);
  console.log("contraseña: ", hash_pas);

  // Query the database for the user with the provided id and hashed password
  const sql = 'SELECT nombre FROM usuarios WHERE id_usuario = ? AND contrasena = UNHEX(?)';
  
  db.execute(sql, [id, hash_pas], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ entrada: false, nombre: '' });
    }

    if (results.length === 0) {
      return res.json({ entrada: false, nombre: '' });
    } else {
      return res.json({ entrada: true, nombre: results[0].nombre });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
//http://localhost:5101/validar/admin/123 