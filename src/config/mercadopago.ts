import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

// Se não tiver token, avisa no log mas não crasha o app inteiro na inicialização
const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  console.warn("⚠️ MP_ACCESS_TOKEN não configurado no .env");
}

const client = new MercadoPagoConfig({ 
    accessToken: accessToken || '', 
    options: { timeout: 5000 } 
});

export const paymentClient = new Payment(client);