import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Import do Firebase Admin (Verifique se o caminho bate com o arquivo que criamos)
import admin from '../../config/firebase'; 
import { UserRepository } from '../../infrastructure/repositories';
import { CreateUserDTO, User } from '../../domain/models';
import { env } from '../../config/env';

export const AuthService = {
  
  // Cadastro Manual
  async signup(data: CreateUserDTO) {
    const exists = await UserRepository.findByEmail(data.email);
    if (exists) throw new Error("E-mail já cadastrado.");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await UserRepository.create({
      ...data,
      password: hashedPassword
    });

    const token = this.generateToken(user);
    return { user, token };
  },

  // Login Manual
  async login(email: string, pass: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Usuário não encontrado.");
    if (!user.password) throw new Error("Usuário logado via Google. Use o botão Google.");

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) throw new Error("Senha incorreta.");

    const token = this.generateToken(user);
    const { password, ...safeUser } = user; 
    return { user: safeUser, token };
  },

  // --- CORREÇÃO DO LOGIN GOOGLE (AGORA DIFERENCIA CHEF/CLIENTE) ---
  async googleLogin(token: string, userType: string = 'client', userName?: string) {
    try {
      // 1. Valida o token vindo do App
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const { email, name: googleName } = decodedToken;
      
      if (!email) throw new Error("Token sem e-mail.");

      // 2. Verifica se o usuário já existe no banco
      let user = await UserRepository.findByEmail(email);

      if (!user) {
        // --- MOMENTO DE CRIAÇÃO ---
        // Se o usuário não existe, criamos com o TIPO escolhido no App
        
        const randomPass = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPass, 10);
        
        user = await UserRepository.create({
          // Preferência: Nome digitado no App > Nome do Google > Genérico
          name: userName || googleName || 'Usuário Google',
          email: email,
          password: hashedPassword,
          // LÓGICA DO TIPO: Se veio 'cook', salva como 'cook', senão 'client'
          type: userType === 'cook' ? 'cook' : 'client' 
        });
      }
      
      // Se o usuário JÁ EXISTIA, ele loga com o tipo que já tinha no banco (segurança)

      // 3. Gera o token JWT do sistema
      const appToken = this.generateToken(user);
      const { password, ...safeUser } = user;
      
      return { user: safeUser, token: appToken };

    } catch (error) {
      console.error("Erro no AuthService Google:", error);
      throw new Error("Token inválido ou expirado.");
    }
  },

  async checkUserExists(email: string) {
    const user = await UserRepository.findByEmail(email);
    return user ? { exists: true, name: user.name } : { exists: false };
  },

  generateToken(user: User) {
    return jwt.sign(
      { id: user.id, type: user.type }, 
      env.jwtSecret, 
      { expiresIn: '30d' }
    );
  }
};