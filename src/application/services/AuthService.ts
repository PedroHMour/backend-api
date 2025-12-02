import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../../infrastructure/repositories';
import { CreateUserDTO, User } from '../../domain/models';
import { env } from '../../config/env';

const googleClient = new OAuth2Client(env.googleClientId);

export const AuthService = {
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

  async login(email: string, pass: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Usuário não encontrado.");
    if (!user.password) throw new Error("Usuário logado via Google. Use o botão Google.");

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) throw new Error("Senha incorreta.");

    const token = this.generateToken(user);
    // Remove a senha do objeto de retorno por segurança
    const { password, ...safeUser } = user; 
    return { user: safeUser, token };
  },

  async googleLogin(token: string) {
    // 1. Valida com o Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Token Google inválido.");

    // 2. Verifica ou Cria
    let user = await UserRepository.findByEmail(payload.email);

    if (!user) {
      // Gera senha aleatória pois é conta Google
      const randomPass = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPass, 10);
      
      user = await UserRepository.create({
        name: payload.name || 'Usuário Google',
        email: payload.email,
        password: hashedPassword,
        type: 'client' // Padrão
      });
    }

    const appToken = this.generateToken(user);
    const { password, ...safeUser } = user;
    return { user: safeUser, token: appToken };
  },

  async checkUserExists(email: string) {
    const user = await UserRepository.findByEmail(email);
    return user ? { exists: true, name: user.name } : { exists: false };
  },

  // Helper privado
  generateToken(user: User) {
    return jwt.sign(
      { id: user.id, type: user.type }, 
      env.jwtSecret, 
      { expiresIn: '30d' }
    );
  }
};