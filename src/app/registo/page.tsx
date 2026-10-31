// src/app/registo/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { countries, Country } from '@/data/countries'; // 🆕 Importar a lista de países

export default function RegistoPage() {
  const router = useRouter();
  
  // Dados do Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🆕 Estado do País Selecionado
  const [paisSelecionado, setPaisSelecionado] = useState<Country>(
    countries.find(c => c.id === 'mz') || countries[0] // Padrão: Moçambique
  );
  const [telefone, setTelefone] = useState('');

  // 🆕 Estado do Modal de Países
  const [modalPaisAberto, setModalPaisAberto] = useState(false);
  const [pesquisaPais, setPesquisaPais] = useState('');

  // Filtrar países pela pesquisa
  const paisesFiltrados = countries.filter(c => 
    c.name.toLowerCase().includes(pesquisaPais.toLowerCase()) || 
    c.code.includes(pesquisaPais)
  );

  // 🆕 Quando o utilizador escolhe um país no modal
  const handleSelecionarPais = (pais: Country) => {
    setPaisSelecionado(pais);
    setModalPaisAberto(false);
    setPesquisaPais(''); // Limpa a pesquisa
  };

  const handleRegisto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captcha) return toast.error('Por favor, confirme que não é um robô.');
    if (password !== confirmPassword) return toast.error('As palavras-passe não coincidem.');
    if (!dataNascimento || !genero) return toast.error('Por favor, preencha todos os dados obrigatórios.');

    setLoading(true);
    const toastId = toast.loading('A criar a sua conta...');

    // A moeda é definida automaticamente com base no país escolhido
    const moedaEscolhida = paisSelecionado.currency;

    const { data, error } = await supabase.auth.signUp({
      email, 
      password,
      options: { 
        data: { 
          nome_completo: nome, 
          telefone: `${paisSelecionado.code} ${telefone}`, // Junta o DDI ao número
          currency: moedaEscolhida,
          data_nascimento: dataNascimento,
          pais_residencia: paisSelecionado.name, // 🆕 Preenchido automaticamente
          genero: genero
        } 
      }
    });

    if (error) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
      setLoading(false); 
      return; 
    }
    
    if (data.user && data.session === null) {
      toast.success('Conta criada! Verifique o seu e-mail.', { id: toastId });
      setLoading(false); 
      return;
    }
    
    toast.success('Conta criada com sucesso!', { id: toastId });
    window.location.href = '/dashboard';
  };

  const inputClass = "w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans py-10">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-white">Konnex</span>
            <span className="text-cyan-400 ml-2">Numbers</span>
          </h1>
          <p className="text-slate-400 text-sm">Crie sua conta para começar.</p>
        </div>

        <form onSubmit={handleRegisto} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputClass} required />
          </div>

          {/* 🆕 Campo de Telefone com Seletor de Países */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Número de Telefone</label>
            <div className="flex gap-2">
              
              {/* Botão que abre o Modal de Países */}
              <button 
                type="button"
                onClick={() => setModalPaisAberto(true)}
                className="flex items-center gap-2 p-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none w-[120px] hover:border-cyan-500 transition-colors"
              >
                <span className="text-xl">{paisSelecionado.flag}</span>
                <span className="text-sm font-bold">{paisSelecionado.code}</span>
              </button>

              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="84XXXXXXX" className={`${inputClass} flex-1`} required />
            </div>
            {/* 🆕 Mostra o país de residência inferido automaticamente */}
            <p className="text-xs text-slate-500 mt-1">País de residência: <span className="text-cyan-400 font-bold">{paisSelecionado.name}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data Nasc.</label>
              <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Género</label>
              <select value={genero} onChange={(e) => setGenero(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-cyan-500" required>
                <option value="" disabled>Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
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

          <div className="flex items-center gap-3 bg-white p-4 rounded-xl mt-4">
            <input type="checkbox" checked={captcha} onChange={(e) => setCaptcha(e.target.checked)} className="w-6 h-6 text-violet-600 rounded border-gray-300 focus:ring-violet-500" />
            <span className="text-slate-800 font-medium text-sm">Não sou um robô</span>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 mt-4">
            {loading ? 'A criar conta...' : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
            Já tem conta? Entre aqui
          </Link>
        </div>
      </div>

      {/* 🆕 MODAL DE SELEÇÃO DE PAÍS COM LUPA DE PESQUISA */}
      {modalPaisAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
            
            {/* Cabeçalho do Modal */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Selecione o País</h3>
              <button onClick={() => setModalPaisAberto(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>

            {/* Barra de Pesquisa (Lupa) */}
            <div className="p-4 bg-white border-b border-gray-100">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Pesquisar país..." 
                  value={pesquisaPais}
                  onChange={(e) => setPesquisaPais(e.target.value)}
                  className="w-full bg-gray-100 text-gray-800 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Países com Scroll */}
            <div className="flex-1 overflow-y-auto p-2">
              {paisesFiltrados.length > 0 ? (
                paisesFiltrados.map((pais) => (
                  <button
                    key={pais.id}
                    onClick={() => handleSelecionarPais(pais)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pais.flag}</span>
                      <span className="font-medium text-gray-800">{pais.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono">{pais.code}</span>
                      {paisSelecionado.id === pais.id && (
                        <span className="text-cyan-600 font-bold">✓</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhum país encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}