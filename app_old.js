const express = require('express');
const { sha512, sha384, sha512_256, sha512_224 } = require('js-sha512');
const db = require('./db');
const app = express();
const port = 5101;

// Middleware to parse JSON
app.use(express.json());

async function validate_user_exists(id){
  // Query the database for the user with the provided id
  const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?';
  
  try{
      const [results] = await
      db.promise().execute(sql, [id]);
      /*if (err) {
          console.error('Error querying the database:', err);
          return err;
      }*/
  
      if (results.length === 0) {
          //crear usuario aquí :v?
          return 0;
      } else {
          return 1;
      }
  }catch(errt){
      console.log("error: ", errt);
      return errt;
  }

}
// Route to validate user
app.get('/cuenta/validar/:id/:pas', (req, res) => {
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

// Route to create user
app.post('/cuenta/crear', async (req, res) => {
  console.log(req.body);
  const { id, pas, nombre } = req.body;
  if(!id || !pas || !nombre){
      console.log("faltan datos");
      return res.status(500).json({ entrada: false, estado: 'faltan datos' });
  }
  try{
      console.log("id: ",id);
      const hash_pas = Buffer.from(sha512.array(pas));//sha512(pas);
      console.log("hash del pas enviado: ", hash_pas);
      console.log("hash del pas 123: ", sha512("123"));
      const validate_exist = await validate_user_exists(id);
      if(validate_exist===0){
          const sql = 'INSERT INTO usuarios (id_usuario, nombre, contrasena) VALUES (?, ?, ?)';

          db.execute(sql, [id, nombre, hash_pas], (err)=>{
              if(err){
                  console.error('Error inserting user: ', err);
                  return res.status(500).json({ entrada: false, estado: 'usuario no creado' });
              }
          });
          return res.json({ entrada: true, estado: 'usuario creado con exito' });
      }else if(validate_exist === 1){
          console.log("usuario ya existe");
          return res.json({ entrada: false, estado: 'usuario ya existe' });
      }else{
          console.log("error de querry: ", validate_exist);
          return res.status(500).json({ entrada: false, estado: 'usuario no creado' });
      }
  }catch (err){
      console.error('Error en el servidor: ', err.message);
      return res.status(500).json({ entrada: false, estado: 'Error en el servidor', detalles: err.message});
  }

});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
//http://localhost:5101/validar/admin/123 