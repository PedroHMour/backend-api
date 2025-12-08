import { Request, Response } from 'express';
// Ajuste os "../" se necessário para chegar na pasta services
import { AuthService } from '../../../application/services/AuthService'; 

class AuthController {
  
  // 1. Cadastro Manual
  async signup(req: Request, res: Response) {
    try {
      const result = await AuthService.signup(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // 2. Login Manual
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  // 3. Login Google (Onde o App bate)
  async googleLogin(req: Request, res: Response) {
    try {
      // Recebe o token que enviamos no 'payload' do App
      const { token } = req.body;
      
      const result = await AuthService.googleLogin(token);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  // 4. Checar se usuário existe
  async checkUser(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.checkUserExists(email);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

// --- ESSA É A LINHA QUE O RAILWAY ESTAVA PEDINDO ---
export default new AuthController();