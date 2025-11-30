const db = require('./db');

async function addCookColumn() {
  try {
    // Adiciona a coluna cook_id na tabela requests
    await db.query(`
      ALTER TABLE requests 
      ADD COLUMN IF NOT EXISTS cook_id INTEGER REFERENCES users(id);
    `);
    console.log("✅ Coluna 'cook_id' adicionada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao atualizar tabela:", err);
  } finally {
    process.exit();
  }
}

addCookColumn();