const db = require('./db');

async function createRequestsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES users(id), -- Quem pediu (conecta com a tabela users)
      dish_description TEXT NOT NULL,         -- O que quer comer
      offer_price DECIMAL(10,2) NOT NULL,     -- Quanto quer pagar
      latitude DECIMAL NOT NULL,              -- Onde está
      longitude DECIMAL NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',   -- 'pending', 'accepted', 'completed'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(query);
    console.log("✅ Tabela 'requests' criada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar tabela:", err);
  } finally {
    process.exit();
  }
}

createRequestsTable();