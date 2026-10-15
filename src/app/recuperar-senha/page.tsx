// src/app/recuperar-senha/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMensagem(`Erro: ${error.message}`);
    else setMensagem('Se o e-mail existir, enviámos um link de recuperação.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Recuperar Senha</h1>
        <p className="text-gray-500 text-sm mb-6 text-center">Insira o seu e-mail para receber o link.</p>
        
        <form onSubmit={handleRecuperar} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="O seu e-mail" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none" required />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md">ENVIAR LINK</button>
        </form>
        
        {mensagem && <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">{mensagem}</div>}
        
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-purple-600 hover:underline">Voltar ao Login</Link>
        </div>
      </div>
    </div>
  );
}