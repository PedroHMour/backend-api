const db = require('./db');

async function createPortfolioTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS chef_portfolio (
      id SERIAL PRIMARY KEY,
      chef_id INTEGER REFERENCES users(id),
      image_url TEXT NOT NULL,
      title VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(query);
    console.log("✅ Tabela 'chef_portfolio' criada!");
  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    process.exit();
  }
}

createPortfolioTable();