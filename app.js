const express = require('express');
const { sha512, sha384, sha512_256, sha512_224 } = require('js-sha512');
const Jugador = require('./usuario');
const db = require('./db');
const app = express();
const port = 5101;

// Middleware to parse JSON
app.use(express.json());

function generate_hash(password) {
    const salt = Math.random().toString(36).substring(2,15);
    const hash = Buffer.from(sha512.array(password+salt));
    return {salt, hash};
}
  
function verify_pass(password, salt, stored_hash){
    const hash = Buffer.from(sha512.array(password+salt));
    return hash.toString() == stored_hash.toString();    
}

async function consult_user(id) {
    // Query the database for the user with the provided id
    const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?';
    let jugador = new Jugador(id, "not_found", -1, "not_found", "not_found");

    try{
        const [results] = await
        db.promise().execute(sql, [id]);
    
        if (results.length === 0) {
            return {result_code:1, data:jugador};

        } else {jugador.set_mmr(results[0].mmr);
            jugador.set_name(results[0].nombre);
            jugador.set_stored_hash(results[0].contrasena);
            jugador.set_salt(results[0].salt);
            return {result_code:0, data:jugador};
        }
    }catch(errt){
        console.log("error: ", errt);
        return {result_code:-1, data: errt};
    }
}

// Route to validate user
app.get('/cuenta/validar/:id', async (req, res) => {
    const { id } = req.params;

    const result_consulta = await consult_user(id);
    if(result_consulta.result_code == -1){
        return res.status(500).json({ entrada: false, error: result_consulta.data });
    }else if(result_consulta.result_code == 0){
        return res.json({ entrada: true, nombre: result_consulta.data.get_name()});
    }else{
        return res.json({ entrada: false, nombre: '' });
    }
});

app.post('/cuenta/iniciar', async (req, res) =>{
    console.log(req.body);
    const {id, pas} = req.body;
    if(!id || !pas){
        console.log("faltan datos");
        return res.status(500).json({ entrada: false, estado: 'faltan datos' });
    }
    try {
        const result_consulta = await consult_user(id);
        if(result_consulta. result_code == -1){
            return res.status(500).json({ entrada: false, error: result_consulta.data });
        }else if(result_consulta.result_code == 0){
            let jugador = result_consulta.data;
            console.log("intentando iniciar: "+jugador.get_name());
            if(verify_pass(pas, jugador.get_salt(), jugador.get_stored_hash())){    
                let now = new Date();
                let hora_inicio = now.toISOString().slice(0, 19).replace('T', ' ');
                let sql = "UPDATE usuarios SET ultimo_inicio = ? WHERE id_usuario = ?";
                let values = [hora_inicio, id];
                db.execute(sql, values, (err) =>{
                    if(err){
                        console.error('Error updating: ', err);
                        return res.status(500).json({ entrada: false, nombre: 'error en inicio de session intente luego' });
                    }
                });
                console.log("sesion iniciada a: "+hora_inicio.toString());
                return res.json({ entrada: true, nombre: jugador.get_name(), player_data:{id_player:id, name:jugador.get_name(), mmr:jugador.get_mmr()}});
            }else{
                console.log("usuario incorrecto ");
                return res.json({ entrada: false, nombre: 'usuario o contraseña incorrecta' });
            }
        }else{
            return res.json({ entrada: false, nombre: 'usuario no existe, verifique sus datos' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ entrada: false, nombre: 'ocurrió un error faltal' });
    }
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
        const hash_salt = generate_hash(pas);
        const hash_pas = hash_salt.hash;
        console.log("hash del pas enviado: ", hash_pas);
        const validate_exist = await consult_user(id);
        if(validate_exist.result_code===1){
            const sql = 'INSERT INTO usuarios (id_usuario, nombre, contrasena, mmr, salt, ultimo_inicio) VALUES (?, ?, ?, ?, ?, ?)';
            let now = new Date();
            let hora_inicio = now.toISOString().slice(0, 19).replace('T', ' ');
            db.execute(sql, [id, nombre, hash_pas, 0, hash_salt.salt, hora_inicio], (err)=>{
                if(err){
                    console.error('Error inserting user: ', err);
                    return res.status(500).json({ entrada: false, estado: 'usuario no creado' });
                }
            });
            return res.json({ entrada: true, estado: 'usuario creado con exito' });
        }else if(validate_exist.result_code === 0){
            console.log("usuario ya existe");
            return res.json({ entrada: false, estado: 'usuario ya existe' });
        }else{
            console.log("error de querry: ", validate_exist.data);
            return res.status(500).json({ entrada: false, estado: 'usuario no creado' });
        }
    }catch (err){
        console.error('Error en el servidor: ', err.message);
        return res.status(500).json({ entrada: false, estado: 'Error en el servidor', detalles: err.message});
    }
  
  });

app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>User BMBR Microservice</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #007bff; }
            </style>
        </head>
        <body>
            <h1>Welcome to the title>User BMBR Microservice 🚀</h1>
            <p>Use the API endpoints to retrieve ranking data.</p>
            <p>Try: <code>/cuenta/validar/:id</code> </p>
        </body>
        </html>
    `);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  //http://localhost:5101/cuenta/validar/admin

  //http://localhost:5101/cuenta/iniciar
  
  //http://localhost:5101/cuenta/crear