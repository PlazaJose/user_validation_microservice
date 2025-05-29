const mysql = require('mysql2');

const local_db = {
  host: 'localhost',//bmbr-server.mysql.database.azure.com
  port: 3306,
  user: 'dbbd_admin',//atbvbruvth
  password: 'dbbd_admin',//Fj7BCi2u$CcTRRAx
  database: 'buscaminasbr_pruebas',
};

const azure_db = {
  host: 'bmbr-server.mysql.database.azure.com',
  port: 3306,
  user: 'atbvbruvth',
  password: 'Fj7BCi2u$CcTRRAx',
  database: 'buscaminasbr_pruebas', 
  ssl:true
}
// Set up the connection to the database
const connection = mysql.createConnection(azure_db);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;