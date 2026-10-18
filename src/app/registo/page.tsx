// src/app/registo/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { COUNTRY_TO_CURRENCY } from '@/lib/currencies';

export default function RegistoPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [paisTelefone, setPaisTelefone] = useState('Moçambique');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleRegisto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) { setMensagem('Por favor, confirme que não é um robô.'); return; }
    if (password !== confirmPassword) { setMensagem('As palavras-passe não coincidem.'); return; }

    setLoading(true);
    setMensagem('');
    const moedaEscolhida = COUNTRY_TO_CURRENCY[paisTelefone] || 'MZN';

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nome_completo: nome, telefone, currency: moedaEscolhida } }
    });

    if (error) { setMensagem(`Erro: ${error.message}`); setLoading(false); return; }
    if (data.user && data.session === null) {
      setMensagem('Conta criada! Verifique o seu e-mail para confirmar.');
      setLoading(false); return;
    }
    
    window.location.href = '/dashboard';
  };

  const inputClass = "w-full p-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8a00e6] via-[#0044ff] to-[#00ffaa] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-950/70 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.jpg" 
              alt="Konnex Numbers" 
              className="w-56 h-auto object-contain rounded-2xl mix-blend-multiply drop-shadow-xl"
            />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-white drop-shadow-md">Konnex</span>
            <span className="text-cyan-400 ml-2 drop-shadow-md">Numbers</span>
          </h1>
          <p className="text-slate-300 text-sm">Crie sua conta e comece a usar.</p>
        </div>

        <form onSubmit={handleRegisto} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nome ou Empresa</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Telefone</label>
            <div className="flex gap-2">
              <select value={paisTelefone} onChange={(e) => setPaisTelefone(e.target.value)} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl text-white outline-none w-2/5 focus:ring-2 focus:ring-cyan-400">
                <option value="Moçambique">🇲🇿 +258</option>
                <option value="Brasil">🇧🇷 +55</option>
                <option value="Portugal">🇵🇹 +351</option>
                <option value="África do Sul">🇿🇦 +27</option>
                <option value="Angola">🇦🇴 +244</option>
                <option value="Estados Unidos">🇺🇸 +1</option>
                <option value="Reino Unido">🇬🇧 +44</option>
              </select>
              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="84XXXXXXX" className={`${inputClass} w-3/5`} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} required minLength={6} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Confirme a Senha</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className={inputClass} required minLength={6} />
          </div>

          <div className="flex items-center gap-3 bg-white/90 p-4 rounded-xl mt-4">
            <input type="checkbox" checked={captcha} onChange={(e) => setCaptcha(e.target.checked)} className="w-6 h-6 text-violet-600 rounded border-gray-300 focus:ring-violet-500" />
            <span className="text-slate-800 font-medium text-sm">Não sou um robô</span>
            <div className="ml-auto text-right">
              <span className="text-xs text-gray-400 block">reCAPTCHA</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 mt-4">
            {loading ? 'A criar conta...' : 'Criar Conta'}
          </button>
        </form>

        {mensagem && (
          <div className={`mt-4 p-4 rounded-xl text-sm text-center border ${mensagem.includes('Erro') || mensagem.includes('não coincidem') ? 'bg-red-900/60 text-red-200 border-red-700' : 'bg-blue-900/60 text-blue-200 border-blue-700'}`}>
            {mensagem}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
            Já tem conta? Entre aqui
          </Link>
        </div>
      </div>
    </div>
  );
}