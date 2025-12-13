import { Request, Response } from 'express';
import { PaymentService } from '../../../application/services';

class PaymentController {

  async payWithPix(req: Request, res: Response) {
    try {
      const result = await PaymentService.createPix(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async payWithCard(req: Request, res: Response) {
    try {
      const result = await PaymentService.createCard(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async webhook(req: Request, res: Response) {
    const { action, data } = req.body;
    try {
      if (action === 'payment.created' || action === 'payment.updated') {
        const payment = await PaymentService.getPayment(data.id);
        console.log(`🔔 Webhook: Pedido ${payment.external_reference} status: ${payment.status}`);
        
        // Futuro: Aqui você chamaria OrderService.updateStatus()
      }
      return res.status(200).send();
    } catch (error) {
      return res.status(500).send();
    }
  }
}

export default new PaymentController();