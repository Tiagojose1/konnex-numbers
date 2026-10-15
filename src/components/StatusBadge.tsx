// src/components/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  tipo: 'status' | 'sms';
  valor: string;
}

export function StatusBadge({ tipo, valor }: StatusBadgeProps) {
  let corClasse = 'bg-gray-100 text-gray-800 border-gray-200';

  if (valor === 'Aguardando' || valor === 'Pendente') {
    corClasse = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else if (valor === 'Concluído' || valor === 'Sucesso') {
    corClasse = 'bg-green-100 text-green-800 border-green-200';
  } else if (valor === 'Cancelado' || valor === 'Expirado') {
    corClasse = 'bg-red-100 text-red-800 border-red-200';
  } else if (valor === 'Reembolsado') {
    corClasse = 'bg-blue-100 text-blue-800 border-blue-200';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${corClasse}`}>
      {valor}
    </span>
  );
}