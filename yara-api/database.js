const mysql = require('mysql2/promise');

// configuracao do banco de dados
// host: onde o banco esta (localhost)
// user: usuario do mysql (no xampp o padrao e root)
// password: senha (no xampp o padrao e vazio)
// database: nome do banco que voce criou
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'yara_db',
  port: 3307, // porta padrao do mysql no xampp
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function connectDB() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return pool;
  } catch (err) {
    console.log('Erro no banco: ' + err.message);
    return null;
  }
}

module.exports = { connectDB };
