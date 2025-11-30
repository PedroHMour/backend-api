const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('Base de Dados conectada com sucesso! 🐘');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};