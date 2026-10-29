// src/types/index.ts
export type OrderStatus = 'Aguardando' | 'Concluído' | 'Cancelado' | 'Reembolsado';
export type SmsStatus = 'Pendente' | 'Sucesso' | 'Expirado';

export interface Order {
  id: string;
  numero: string;
  status: OrderStatus;
  sms_otp: SmsStatus;
  codigo_recebido?: string;
  pais: string;
  servico: string;
  valor: number;
  data_criacao: string;
  data_criacao_raw: string;
  provider_name?: string;      // 🆕 Adicionado
  provider_order_id?: string;  // 🆕 Adicionado
}