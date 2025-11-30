const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const db = require('./db'); // Conexão com o banco (arquivo db.js na mesma pasta)
const bcrypt = require('bcryptjs'); // Criptografia de senha
const jwt = require('jsonwebtoken'); // Token de sessão
const { OAuth2Client } = require('google-auth-library'); // Login Google

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "SEGREDO_SUPER_SECRETO_DO_CHEF"; // Em produção, use .env

// --- CONFIGURAÇÃO GOOGLE ---
// Substitua pelo SEU ID DO CLIENTE WEB gerado no Google Cloud
const GOOGLE_CLIENT_ID = "1018879454844-aj3mkuaol995iej7difc9gvrti9kffgv.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- CONFIGURAÇÃO SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexão de qualquer lugar (App/Emulador)
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ==========================================
// 🔐 AUTENTICAÇÃO E USUÁRIOS
// ==========================================

// ROTA 1: Verificar se E-mail existe (Fluxo estilo Uber)
app.post('/check-user', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query("SELECT id, name FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      res.json({ exists: true, name: result.rows[0].name });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao verificar usuário." });
  }
});

// ROTA 2: Login com Google (OAuth)
app.post('/auth/google', async (req, res) => {
  const { token } = req.body;
  
  try {
    // 1. Valida o token com o Google
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    
    const email = payload.email;
    const name = payload.name;

    console.log(`Login Google recebido: ${email}`);

    // 2. Verifica/Cria Usuário
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;

    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
    } else {
      // Cria conta automática com senha aleatória segura
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const newUser = await db.query(
        "INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING id, name, email, type",
        [name, email, randomPassword, 'client'] // Padrão: Cliente
      );
      user = newUser.rows[0];
    }

    // 3. Gera Token JWT
    const appToken = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ message: "Sucesso Google", user, token: appToken });

  } catch (err) {
    console.error("Erro Google:", err);
    res.status(401).json({ error: "Token Google inválido" });
  }
});

// ROTA 3: Cadastro Manual
app.post('/signup', async (req, res) => {
  const { name, email, password, type } = req.body;
  try {
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ error: "E-mail já cadastrado." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING id, name, email, type",
      [name, email, hashedPassword, type]
    );
    
    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ message: "Sucesso", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar." });
  }
});

// ROTA 4: Login Manual
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Usuário não encontrado." });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Senha incorreta." });

    const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '30d' });
    delete user.password; 

    res.json({ message: "Login OK", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login." });
  }
});

// ROTA 5: Estatísticas do Usuário
app.get('/users/:id/stats', async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await db.query("SELECT id, name, email, type FROM users WHERE id = $1", [id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    let stats = { count: 0, total: 0 };
    if (user.type === 'cook') {
      const r = await db.query(`SELECT COUNT(*) as count, SUM(offer_price) as total FROM requests WHERE cook_id = $1 AND status = 'completed'`, [id]);
      stats = r.rows[0];
    } else {
      const r = await db.query(`SELECT COUNT(*) as count FROM requests WHERE client_id = $1 AND status = 'completed'`, [id]);
      stats.count = r.rows[0].count;
    }
    res.json({ user, stats: { completed_orders: stats.count || 0, total_earnings: stats.total || 0 } });
  } catch (err) { res.status(500).json({ error: "Erro stats" }); }
});

// ==========================================
// 🥘 PEDIDOS E FLUXO
// ==========================================

// Criar Pedido
app.post('/requests', async (req, res) => {
  const { client_id, dish, price, latitude, longitude } = req.body;
  try {
    const newRequest = await db.query(
      "INSERT INTO requests (client_id, dish_description, offer_price, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [client_id, dish, price, latitude, longitude]
    );
    io.emit('new_order_available', newRequest.rows[0]);
    res.status(201).json(newRequest.rows[0]);
  } catch (err) { res.status(500).json({ error: "Erro ao criar pedido." }); }
});

// Listar Pendentes
app.get('/requests', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, u.name as client_name 
      FROM requests r JOIN users u ON r.client_id = u.id
      WHERE r.status = 'pending' ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Erro" }); }
});

// Aceitar Pedido
app.post('/requests/accept', async (req, res) => {
  const { request_id, cook_id } = req.body;
  try {
    const result = await db.query(
      "UPDATE requests SET status = 'accepted', cook_id = $1 WHERE id = $2 RETURNING *",
      [cook_id, request_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Não encontrado" });
    
    io.to(`order_${request_id}`).emit('order_status_update', { status: 'accepted' });
    res.json({ message: "Aceito", request: result.rows[0] });
  } catch (err) { res.status(500).json({ error: "Erro" }); }
});

// Atualizar Status (Chegou, Cozinhando, Finalizou)
app.post('/requests/update-status', async (req, res) => {
  const { request_id, new_status } = req.body;
  const validStatuses = ['arrived', 'cooking', 'completed']; 
  if (!validStatuses.includes(new_status)) return res.status(400).json({ error: "Status inválido." });

  try {
    const result = await db.query(
      "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
      [new_status, request_id]
    );
    const updatedOrder = result.rows[0];
    io.to(`order_${request_id}`).emit('order_status_update', updatedOrder);
    res.json({ message: "Status atualizado!", request: updatedOrder });
  } catch (err) { res.status(500).json({ error: "Erro interno." }); }
});

// Meus Pedidos Ativos (Cozinheiro)
app.get('/requests/accepted-by/:cook_id', async (req, res) => {
  const { cook_id } = req.params;
  try {
    const result = await db.query(`
      SELECT r.*, u.name as client_name 
      FROM requests r JOIN users u ON r.client_id = u.id
      WHERE r.cook_id = $1 AND r.status IN ('accepted', 'arrived', 'cooking')
      ORDER BY r.created_at DESC
    `, [cook_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Erro" }); }
});

// Meu Pedido Ativo (Cliente)
app.get('/requests/my-active-order/:client_id', async (req, res) => {
  const { client_id } = req.params;
  try {
    const result = await db.query(`
      SELECT r.*, u.name as cook_name 
      FROM requests r LEFT JOIN users u ON r.cook_id = u.id
      WHERE r.client_id = $1 AND r.status IN ('pending', 'accepted', 'arrived', 'cooking')
      ORDER BY r.created_at DESC LIMIT 1
    `, [client_id]);
    res.json(result.rows.length > 0 ? result.rows[0] : null);
  } catch (err) { res.status(500).json({ error: "Erro" }); }
});

// Histórico (Finalizados)
app.get('/requests/history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await db.query(`
      SELECT r.*, u.name as client_name 
      FROM requests r JOIN users u ON r.client_id = u.id
      WHERE (r.client_id = $1 OR r.cook_id = $1) AND r.status = 'completed'
      ORDER BY r.created_at DESC
    `, [user_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Erro" }); }
});

// ==========================================
// ⭐ AVALIAÇÕES E CHAT
// ==========================================

app.post('/reviews', async (req, res) => {
  const { request_id, reviewer_id, reviewed_id, rating, comment } = req.body;
  try {
    await db.query(
      "INSERT INTO reviews (request_id, reviewer_id, reviewed_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
      [request_id, reviewer_id, reviewed_id, rating, comment]
    );
    res.status(201).json({ message: "Avaliado!" });
  } catch (err) { res.status(500).json({ error: "Erro ao avaliar." }); }
});

app.get('/messages/:request_id', async (req, res) => {
  const { request_id } = req.params;
  try {
    const result = await db.query("SELECT * FROM messages WHERE request_id = $1 ORDER BY created_at ASC", [request_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Erro" }); }
});

// ==========================================
// ⚡ SOCKET.IO
// ==========================================

io.on('connection', (socket) => {
  console.log(`⚡ Socket Conectado: ${socket.id}`);

  socket.on('join_room', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const savedMsg = await db.query(
        "INSERT INTO messages (request_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *", 
        [data.request_id, data.sender_id, data.content]
      );
      io.to(`order_${data.request_id}`).emit('receive_message', savedMsg.rows[0]);
    } catch (error) { console.error(error); }
  });
});

// ==========================================
// 📸 PORTFÓLIO DO CHEF
// ==========================================

// Adicionar Foto ao Portfólio
app.post('/portfolio', async (req, res) => {
  const { chef_id, image_url, title } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO chef_portfolio (chef_id, image_url, title) VALUES ($1, $2, $3) RETURNING *",
      [chef_id, image_url, title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar foto." });
  }
});

// Listar Fotos de um Chef
app.get('/portfolio/:chef_id', async (req, res) => {
  const { chef_id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM chef_portfolio WHERE chef_id = $1 ORDER BY created_at DESC",
      [chef_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar fotos." });
  }
});

// Deletar Foto
app.delete('/portfolio/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM chef_portfolio WHERE id = $1", [id]);
    res.json({ message: "Foto removida." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar." });
  }
});

server.listen(PORT, () => console.log(`--------------------------------------------------\nServidor OAUTH rodando na porta ${PORT} 🚀\n--------------------------------------------------`));