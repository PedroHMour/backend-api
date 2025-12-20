import { Request, Response } from 'express';
import { db } from '../../../infrastructure/database'; // Ajuste o import do db conforme sua estrutura

class RequestController {

  // GET /requests (Lista todos os pedidos pendentes)
  async index(req: Request, res: Response) {
    try {
      const result = await db.query(`
        SELECT r.*, u.name as client_name 
        FROM requests r
        JOIN users u ON r.client_id = u.id
        WHERE r.status = 'pending'
      `);
      return res.json(result.rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // GET /requests/my-active-order/:id
  async showActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT r.*, c.name as cook_name 
        FROM requests r
        LEFT JOIN users c ON r.cook_id = c.id
        WHERE r.client_id = $1 AND r.status != 'completed'
        ORDER BY r.created_at DESC LIMIT 1
      `, [id]);
      
      return res.json(result.rows[0] || {});
    } catch (error: any) {
      return res.json({});
    }
  }

  // GET /requests/accepted-by/:id
  async listAcceptedBy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT r.*, u.name as client_name
        FROM requests r
        JOIN users u ON r.client_id = u.id
        WHERE r.cook_id = $1 AND r.status != 'completed'
      `, [id]);
      return res.json(result.rows);
    } catch (error: any) {
      return res.json([]);
    }
  }

  // POST /requests (Criar pedido)
  async store(req: Request, res: Response) {
    try {
      const { client_id, dish_description, offer_price, latitude, longitude } = req.body;
      await db.query(`
        INSERT INTO requests (client_id, dish_description, offer_price, latitude, longitude, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
      `, [client_id, dish_description, offer_price, latitude, longitude]);
      
      return res.status(201).json({ message: 'Pedido criado' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /requests/accept
  async accept(req: Request, res: Response) {
    try {
      const { request_id, cook_id } = req.body;
      
      // Verifica se já não foi pego
      const check = await db.query('SELECT status FROM requests WHERE id = $1', [request_id]);
      if(check.rows[0].status !== 'pending') {
         return res.status(400).json({ error: 'Pedido já aceito por outro.' });
      }

      await db.query(`
        UPDATE requests SET status = 'accepted', cook_id = $1 WHERE id = $2
      `, [cook_id, request_id]);
      
      return res.json({ message: 'Aceito' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /requests/update-status
  async updateStatus(req: Request, res: Response) {
    try {
      const { request_id, new_status } = req.body;
      await db.query('UPDATE requests SET status = $1 WHERE id = $2', [new_status, request_id]);
      return res.json({ message: 'Atualizado' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new RequestController();