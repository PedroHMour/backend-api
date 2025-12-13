export interface PaymentPixDTO {
  transaction_amount: number;
  description: string;
  payer_email: string;
  payer_first_name: string;
  external_reference: string; // ID do pedido
}

export interface PaymentCardDTO extends PaymentPixDTO {
  token: string;          // Token do cartão gerado no frontend
  installments: number;   // Parcelas
  payment_method_id: string; // "master", "visa"
  issuer_id: string;      // Banco emissor
  payer_cpf: string;      // CPF é obrigatório para cartão
}