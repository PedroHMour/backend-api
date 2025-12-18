import { db } from '../database';
import { User, CreateUserDTO } from '../../domain/models';

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async create(data: CreateUserDTO): Promise<User> {
    // Agora aceitamos que o banco use os valores default para gender/premium se não forem passados
    const result = await db.query(
      'INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.email, data.password, data.type]
    );
    return result.rows[0];
  },

  async findById(id: number): Promise<User | null> {
    const result = await db.query('SELECT id, name, email, type, gender, is_premium, avatar_url FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getStats(userId: number, type: string) {
    if (type === 'cook') {
      const res = await db.query(
        `SELECT COUNT(*) as count, SUM(offer_price) as total 
         FROM requests WHERE cook_id = $1 AND status = 'completed'`,
        [userId]
      );
      return {
        completed_orders: Number(res.rows[0].count) || 0,
        total_earnings: Number(res.rows[0].total) || 0
      };
    } else {
      const res = await db.query(
        `SELECT COUNT(*) as count FROM requests WHERE client_id = $1 AND status = 'completed'`,
        [userId]
      );
      return {
        completed_orders: Number(res.rows[0].count) || 0,
        total_earnings: 0
      };
    }
  },

  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  },

  // --- NOVOS MÉTODOS PARA O MAPA ---

  // Busca todos os chefes que têm localização definida
  async findAllCooks(): Promise<User[]> {
    const result = await db.query(`
      SELECT id, name, email, type, gender, is_premium, latitude, longitude, avatar_url 
      FROM users 
      WHERE type = 'cook' AND latitude IS NOT NULL
    `);
    return result.rows;
  },

  // Atualiza a posição do usuário (GPS)
  async updateLocation(id: number, lat: number, lng: number): Promise<void> {
    await db.query(
      'UPDATE users SET latitude = $1, longitude = $2 WHERE id = $3',
      [lat, lng, id]
    );
  }
};