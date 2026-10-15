// src/mockData.ts
import { Order } from '@/types';

export const pedidosIniciais: Order[] = [
  { 
    id: '1', 
    numero: '+258 84 XXX XXXX', 
    status: 'Aguardando', 
    sms_otp: 'Pendente', 
    pais: 'Moçambique', 
    servico: 'WhatsApp', 
    valor: 3.85, 
    data_criacao: '07/10/2026 14:30',
    data_criacao_raw: '2026-10-07T14:30:00Z'
  },
  { 
    id: '2', 
    numero: '+55 11 XXXXX-XXXX', 
    status: 'Concluído', 
    sms_otp: 'Sucesso', 
    codigo_recebido: '512-067', 
    pais: 'Brasil', 
    servico: 'Telegram', 
    valor: 1.93, 
    data_criacao: '07/10/2026 14:35',
    data_criacao_raw: '2026-10-07T14:35:00Z'
  },
  { 
    id: '3', 
    numero: '+351 XXX XXX XXX', 
    status: 'Reembolsado', 
    sms_otp: 'Expirado', 
    pais: 'Portugal', 
    servico: 'Google', 
    valor: 0.77, 
    data_criacao: '07/10/2026 14:40',
    data_criacao_raw: '2026-10-07T14:40:00Z'
  },
];