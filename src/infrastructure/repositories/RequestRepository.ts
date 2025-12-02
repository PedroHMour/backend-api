import { db } from '../database';
import { CreateRequestDTO, RequestOrder } from '../../domain/models';

export const RequestRepository = {
  async create(data: CreateRequestDTO): Promise<RequestOrder> {
    const result = await db.query(
      `INSERT INTO requests (client_id, dish_description, offer_price, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.client_id, data.dish_description, data.offer_price, data.latitude, data.longitude]
    );
    return result.rows[0];
  },

  async findAllPending(): Promise<RequestOrder[]> {
    const result = await db.query(`
      SELECT r.*, u.name as client_name 
      FROM requests r 
      JOIN users u ON r.client_id = u.id
      WHERE r.status = 'pending' 
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  },

  async findActiveByClient(clientId: number): Promise<RequestOrder | null> {
    const result = await db.query(`
      SELECT r.*, u.name as cook_name 
      FROM requests r 
      LEFT JOIN users u ON r.cook_id = u.id
      WHERE r.client_id = $1 
      AND r.status IN ('pending', 'accepted', 'arrived', 'cooking')
      ORDER BY r.created_at DESC LIMIT 1
    `, [clientId]);
    return result.rows[0] || null;
  },

  async findActiveByCook(cookId: number): Promise<RequestOrder[]> {
    const result = await db.query(`
      SELECT r.*, u.name as client_name 
      FROM requests r 
      JOIN users u ON r.client_id = u.id
      WHERE r.cook_id = $1 
      AND r.status IN ('accepted', 'arrived', 'cooking')
      ORDER BY r.created_at DESC
    `, [cookId]);
    return result.rows;
  },

  async updateStatus(id: number, status: string): Promise<RequestOrder | null> {
    const result = await db.query(
      "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0] || null;
  },

  async accept(requestId: number, cookId: number): Promise<RequestOrder | null> {
    const result = await db.query(
      "UPDATE requests SET status = 'accepted', cook_id = $1 WHERE id = $2 RETURNING *",
      [cookId, requestId]
    );
    return result.rows[0] || null;
  },

  async getHistory(userId: number): Promise<RequestOrder[]> {
    const result = await db.query(`
      SELECT r.*, u.name as client_name 
      FROM requests r 
      JOIN users u ON r.client_id = u.id
      WHERE (r.client_id = $1 OR r.cook_id = $1) AND r.status = 'completed'
      ORDER BY r.created_at DESC
    `, [userId]);
    return result.rows;
  }
};