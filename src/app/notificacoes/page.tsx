// src/app/notificacoes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notificacao {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificacoesPage() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarNotificacoes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setNotificacoes(data);
      
      // Marcar todas como lidas ao abrir a página
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
      
      setLoading(false);
    };
    carregarNotificacoes();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans text-white pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notificações</h1>

        {loading ? (
          <p className="text-slate-400 text-center">A carregar...</p>
        ) : notificacoes.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
            <span className="text-4xl block mb-2">📭</span>
            Não tem notificações novas.
          </div>
        ) : (
          <div className="space-y-3">
            {notificacoes.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.is_read ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-blue-500'} transition-colors`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm text-white">{n.title}</h3>
                  <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
              </div>
            ))}
          </div>
        )}

        <Link href="/dashboard" className="block w-full text-center bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors mt-8">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}