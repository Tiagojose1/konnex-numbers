// src/app/registo/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { COUNTRY_TO_CURRENCY } from '@/lib/currencies';

export default function RegistoPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [paisTelefone, setPaisTelefone] = useState('Moçambique'); // NOVO
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleRegisto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captcha) {
      setMensagem('Por favor, confirme que não é um robô.');
      return;
    }

    if (password !== confirmPassword) {
      setMensagem('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);
    setMensagem('');

    // AQUI ESTÁ A MÁGICA: A moeda é escolhida com base no país do telefone
    const moedaEscolhida = COUNTRY_TO_CURRENCY[paisTelefone] || 'MZN';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo: nome,
          telefone: telefone,
          currency: moedaEscolhida, // <-- Moeda guardada nos metadados
        }
      }
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.user && data.session === null) {
      setMensagem('Conta criada! Verifique o seu e-mail para confirmar o registo antes de entrar.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const inputClass = "w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Konnex Numbers" className="h-20 mx-auto mb-4" /> 
          <p className="text-slate-400 text-sm">
            Crie sua conta e acesse o painel para comprar números virtuais.
          </p>
        </div>

        <form onSubmit={handleRegisto} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome ou Empresa</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome ou razão social" className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail (usado para login)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Telefone</label>
            <div className="flex gap-2">
              {/* O onChange do select guarda o PAÍS escolhido */}
              <select 
                value={paisTelefone}
                onChange={(e) => setPaisTelefone(e.target.value)}
                className="p-4 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none w-2/5"
              >
                <option value="Moçambique">🇲🇿 +258</option>
                <option value="Brasil">🇧🇷 +55</option>
                <option value="Portugal">🇵🇹 +351</option>
                <option value="África do Sul">🇿🇦 +27</option>
                <option value="Angola">🇦🇴 +244</option>
                <option value="Estados Unidos">🇺🇸 +1</option>
                <option value="Reino Unido">🇬🇧 +44</option>
              </select>
              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 91234-5678" className={`${inputClass} w-3/5`} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} required minLength={6} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirme a Senha</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className={inputClass} required minLength={6} />
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-lg mt-6">
            <input type="checkbox" checked={captcha} onChange={(e) => setCaptcha(e.target.checked)} className="w-6 h-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            <span className="text-black font-medium">Não sou um robô</span>
            <div className="ml-auto text-right">
              <span className="text-xs text-gray-400 block">reCAPTCHA</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg mt-4 disabled:opacity-50">
            {loading ? 'A criar conta...' : 'Criar Conta'}
          </button>
        </form>

        {mensagem && (
          <div className={`mt-4 p-4 rounded-lg text-sm text-center border ${mensagem.includes('Erro') || mensagem.includes('não coincidem') ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-blue-900/50 text-blue-400 border-blue-800'}`}>
            {mensagem}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors">
            Já tem conta? Entre aqui
          </Link>
        </div>
      </div>
    </div>
  );
}