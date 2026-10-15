// src/mockData.ts
import { Order } from '@/types';

export const pedidosIniciais: Order[] = [
  {
    id: '1',
    numero: '+258 84 5284613',
    status: 'Aguardando',
    sms_otp: 'Pendente',
    pais: 'Moçambique',
    servico: 'WhatsApp',
    valor: 3.85,
    data_criacao: '07/10/2026 14:30',
  },
  {
    id: '2',
    numero: '+55 11 949956778',
    status: 'Concluído',
    sms_otp: 'Sucesso',
    codigo_recebido: '512-067',
    pais: 'Brasil',
    servico: 'Telegram',
    valor: 1.93,
    data_criacao: '07/10/2026 14:35',
  },
  {
    id: '3',
    numero: '+351 666876989',
    status: 'Reembolsado',
    sms_otp: 'Expirado',
    pais: 'Portugal',
    servico: 'Google',
    valor: 0.77,
    data_criacao: '07/10/2026 14:40',
  },
];