/* eslint-disable @next/next/no-img-element */
// src/app/apoio/page.tsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface Mensagem {
  id: number;
  autor: 'Bete' | 'Você';
  texto: string;
  imagem?: string | null;
  isUser: boolean;
}

export default function ApoioPage() {
  // ─── Estados do FAQ ───
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [pesquisaFaq, setPesquisaFaq] = useState('');

  // ─── Estados do Chat ───
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [historico, setHistorico] = useState<Mensagem[]>([
    { id: 1, autor: 'Bete', texto: 'Olá! Sou a Bete, a assistente virtual do Konnex Numbers. Como posso ajudar você hoje?', isUser: false }
  ]);

  const faqs = [
    { pergunta: 'Como funciona o reembolso?', resposta: 'Se o SMS não chegar dentro de 10 minutos, o valor é devolvido automaticamente ao seu saldo principal.' },
    { pergunta: 'Quais os métodos de pagamento?', resposta: 'Aceitamos M-Pesa, e-Mola, Cartão de Crédito e Transferência Bancária.' },
    { pergunta: 'O que é um número virtual?', resposta: 'É um número temporário que recebe SMS, sem precisar de um chip físico, ideal para verificações.' },
    { pergunta: 'Posso usar o número no WhatsApp?', resposta: 'Sim! Os nossos números são compatíveis com WhatsApp, Telegram e centenas de outros serviços.' },
  ];

  // Filtrar FAQ pela pesquisa
  const faqsFiltrados = faqs.filter(faq => 
    faq.pergunta.toLowerCase().includes(pesquisaFaq.toLowerCase()) || 
    faq.resposta.toLowerCase().includes(pesquisaFaq.toLowerCase())
  );

  // Auto-scroll para a última mensagem do chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico, chatAberto]);

  // ─── Funções do Chat ───
  const handleAnexarImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImagemAnexada(url);
      toast.success('Foto anexada com sucesso!');
    }
  };

  const simularRespostaBete = (textoUtilizador: string) => {
    const texto = textoUtilizador.toLowerCase();
    let resposta = 'Entendi a sua mensagem. Já registei o seu pedido de ajuda, e um dos nossos agentes humanos irá responder em breve.';

    if (texto.includes('olá') || texto.includes('ola') || texto.includes('bom dia') || texto.includes('boa tarde')) {
      resposta = 'Olá! Como posso ajudar hoje? Pode perguntar sobre saldo, reembolsos ou como comprar um número.';
    } else if (texto.includes('reembolso') || texto.includes('devolver') || texto.includes('dinheiro')) {
      resposta = 'Os reembolsos são automáticos. Se o SMS não chegar em 10 minutos, o valor volta para o seu saldo. Se não recebeu, por favor anexe uma foto do ecrã.';
    } else if (texto.includes('saldo') || texto.includes('recarregar') || texto.includes('depositar')) {
      resposta = 'Para adicionar saldo, vá ao menu "Saldo" no fundo do ecrã e escolha o valor. Aceitamos M-Pesa e e-Mola.';
    } else if (texto.includes('número') || texto.includes('numero') || texto.includes('comprar')) {
      resposta = 'Para comprar um número, vá à aba "Serviços", escolha o país e o aplicativo (ex: WhatsApp) e clique em OBTER.';
    } else if (texto.includes('foto') || texto.includes('imagem') || texto.includes('anexo')) {
      resposta = 'Recebi a sua foto! Um agente vai analisar o comprovativo ou o erro e entrará em contacto.';
    }

    setTimeout(() => {
      setHistorico(prev => [...prev, {
        id: Date.now(),
        autor: 'Bete',
        texto: resposta,
        isUser: false
      }]);
    }, 1200); // Simula o tempo que a Bete demora a responder
  };

  const handleEnviarMensagem = () => {
    if (!mensagem.trim() && !imagemAnexada) return;

    const textoEnviado = mensagem;

    // Adiciona a mensagem do utilizador
    const novaMensagem: Mensagem = {
      id: Date.now(),
      autor: 'Você',
      texto: textoEnviado,
      imagem: imagemAnexada,
      isUser: true
    };

    setHistorico(prev => [...prev, novaMensagem]);
    setMensagem('');
    setImagemAnexada(null);

    // Chama a Bete para responder
    simularRespostaBete(textoEnviado);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Cabeçalho */}
      <header className="bg-white px-6 py-5 border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-slate-900">Apoio ao Cliente</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        
        {/* Card da Bete */}
        <div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden text-white">
          <div className="relative z-10 w-2/3">
            <h4 className="text-xl font-extrabold mb-1">Assistente Virtual Bete</h4>
            <p className="text-xs text-blue-100 mb-4">Inteligente, respeitosa e amigável. Tire dúvidas ou envie reclamações com fotos.</p>
            <button 
              onClick={() => setChatAberto(!chatAberto)}
              className="bg-white text-blue-800 text-xs font-bold py-2 px-5 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
            >
              {chatAberto ? 'Fechar Chat' : 'Iniciar Chat Integrado'}
            </button>
          </div>
          <div className="absolute right-2 bottom-2 text-7xl opacity-80">🤖</div>
        </div>

        {/* 🆕 JANELA DE CHAT FUNCIONAL */}
        {chatAberto && (
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 mb-8 overflow-hidden flex flex-col h-[450px]">
            {/* Cabeçalho do Chat */}
            <div className="bg-[#0f172a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl">🤖</div>
                <div>
                  <h3 className="font-bold text-white text-sm">Bete (IA)</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setChatAberto(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Área das Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {historico.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.isUser 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    <p>{msg.texto}</p>
                    {msg.imagem && (
                      <img src={msg.imagem} alt="Anexo" className="mt-2 rounded-lg max-h-32 object-cover border border-white/20" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Área de Input e Upload */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-600 p-2 text-xl" title="Anexar foto">
                📎
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAnexarImagem} className="hidden" />

              {imagemAnexada && (
                <div className="relative w-8 h-8 rounded border border-blue-300 overflow-hidden flex-shrink-0">
                  <img src={imagemAnexada} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => setImagemAnexada(null)} className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-3 h-3 flex items-center justify-center">x</button>
                </div>
              )}

              <input 
                type="text" 
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva aqui..." 
                className="flex-1 bg-slate-100 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleEnviarMensagem()}
              />
              
              <button onClick={handleEnviarMensagem} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm">
                Enviar
              </button>
            </div>
          </div>
        )}

        {/* Caixa de Entrada (Simulada) */}
        <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">Contacto de apoio</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <button 
            onClick={() => toast.info('Ainda não tem mensagens na sua caixa de entrada.')}
            className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">📩</span>
              <div className="text-left">
                <span className="block font-bold text-slate-800">Caixa de entrada</span>
                <span className="block text-xs text-slate-500">Verificar as suas mensagens</span>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </button>
        </div>

        {/* FAQ com Pesquisa */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Perguntas mais frequentes</h2>
        
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar uma dúvida..." 
            value={pesquisaFaq}
            onChange={(e) => setPesquisaFaq(e.target.value)}
            className="w-full bg-white text-slate-700 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {faqsFiltrados.length > 0 ? (
            faqsFiltrados.map((faq, index) => (
              <div key={index} className="border-b border-slate-100 last:border-0">
                <button 
                  onClick={() => setFaqAberto(faqAberto === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 text-left"
                >
                  <span className="font-bold text-slate-800 text-sm">{faq.pergunta}</span>
                  <span className={`text-slate-400 transform transition-transform ${faqAberto === index ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {faqAberto === index && (
                  <div className="px-5 pb-5 text-sm text-slate-600 bg-slate-50/50">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              Nenhuma pergunta encontrada para &quot;{pesquisaFaq}&quot;.
            </div>
          )}
        </div>

      </div>

      {/* Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">🏠</span><span className="text-[10px] font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">🌐</span><span className="text-[10px] font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">💰</span><span className="text-[10px] font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/apoio" className="flex flex-col items-center text-blue-600 p-2">
          <span className="text-xl">🎧</span><span className="text-[10px] font-bold mt-1">Apoio</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}