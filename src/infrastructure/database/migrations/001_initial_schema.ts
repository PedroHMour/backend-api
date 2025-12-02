export const initialSchema = [
  // 1. Tabela de Usuários
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // 2. Tabela de Pedidos
  `CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    cook_id INTEGER REFERENCES users(id),
    dish_description TEXT NOT NULL,
    offer_price DECIMAL(10,2) NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // 3. Tabela de Mensagens
  `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id),
    sender_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // 4. Tabela de Portfólio
  `CREATE TABLE IF NOT EXISTS chef_portfolio (
    id SERIAL PRIMARY KEY,
    chef_id INTEGER REFERENCES users(id),
    image_url TEXT NOT NULL,
    title VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // 5. Tabela de Avaliações
  `CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    request_id INTEGER UNIQUE REFERENCES requests(id),
    reviewer_id INTEGER REFERENCES users(id),
    reviewed_id INTEGER REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`
];