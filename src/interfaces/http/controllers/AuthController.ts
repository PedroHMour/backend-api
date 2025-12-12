import { Request, Response } from 'express';
// Certifique-se que o caminho do import está correto para sua estrutura
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

  // 3. Login Google (ATUALIZADO)
  async googleLogin(req: Request, res: Response) {
    try {
      // CORREÇÃO: Pegamos token, type e name enviados pelo App
      const { token, type, name } = req.body;
      
      const result = await AuthService.googleLogin(token, type, name);
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

export default new AuthController();