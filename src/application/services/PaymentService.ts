import { paymentClient } from '../../config/mercadopago';
import { PaymentPixDTO, PaymentCardDTO } from '../../domain/models';

export const PaymentService = {
  
  // 1. Gerar PIX
  async createPix(data: PaymentPixDTO) {
    try {
      const response = await paymentClient.create({
        body: {
          transaction_amount: data.transaction_amount,
          description: data.description,
          payment_method_id: 'pix',
          payer: {
            email: data.payer_email,
            first_name: data.payer_first_name
          },
          external_reference: data.external_reference,
          notification_url: process.env.WEBHOOK_URL 
        }
      });

      return {
        id: response.id,
        status: response.status,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.point_of_interaction?.transaction_data?.ticket_url
      };
    } catch (error: any) {
      console.error("Erro MP Pix:", error);
      throw new Error("Falha ao gerar Pix.");
    }
  },

  // 2. Processar Cartão (Transparente)
  async createCard(data: PaymentCardDTO) {
    try {
      const response = await paymentClient.create({
        body: {
          transaction_amount: data.transaction_amount,
          token: data.token,
          description: data.description,
          installments: data.installments,
          payment_method_id: data.payment_method_id,
          issuer_id: data.issuer_id,
          payer: {
            email: data.payer_email,
            first_name: data.payer_first_name,
            identification: { type: "CPF", number: data.payer_cpf }
          },
          external_reference: data.external_reference,
          notification_url: process.env.WEBHOOK_URL
        }
      });

      return {
        id: response.id,
        status: response.status, // approved, rejected
        status_detail: response.status_detail
      };
    } catch (error: any) {
      console.error("Erro MP Cartão:", error);
      throw new Error("Falha ao processar cartão.");
    }
  },

  // 3. Consultar Pagamento (Para o Webhook)
  async getPayment(id: string) {
    return await paymentClient.get({ id });
  }
};