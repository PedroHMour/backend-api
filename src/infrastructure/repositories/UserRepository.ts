import { db } from '../database';
import { User, CreateUserDTO } from '../../domain/models';

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async create(data: CreateUserDTO): Promise<User> {
    const result = await db.query(
      'INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.email, data.password, data.type]
    );
    return result.rows[0];
  },

  async findById(id: number): Promise<User | null> {
    const result = await db.query('SELECT id, name, email, type FROM users WHERE id = $1', [id]);
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
  }
};