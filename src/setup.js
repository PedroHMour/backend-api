const db = require('./db');

async function createTables() {
  const queryUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL, -- 'client' ou 'cook'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(queryUsers);
    console.log("✅ Tabela 'users' criada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar tabela:", err);
  } finally {
    process.exit(); // Encerra o script
  }
}

createTables();