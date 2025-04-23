const mysql = require('mysql2');

// Set up the connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'dbbd_admin',
  password: 'dbbd_admin',
  database: 'buscaminasbr_pruebas',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;