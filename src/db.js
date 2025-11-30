const { Pool } = require('pg');
require('dotenv').config();

// Verifica se a URL existe
if (!process.env.DATABASE_URL) {
  console.error("❌ ERRO: DATABASE_URL faltando no arquivo .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Permite conexão SSL com Supabase
  }
});

pool.on('connect', () => {
  // console.log('Base conectada!');
});

pool.on('error', (err) => {
  console.error('❌ Erro no Banco:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};