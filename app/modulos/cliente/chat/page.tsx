/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Send, Menu, X, PlusCircle, LogOut, MessageSquare } from 'lucide-react';

interface Thread {
  thread_id: string;
  ultima_atividade: string;
  ultima_mensagem: string;
}

interface Mensagem {
  direcao: 'entrada' | 'saida';
  conteudo: string;
  criado_em: string;
}

export default function PaginaChatCliente() {
  const { data: sessao, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadAtualId, setThreadAtualId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [novaConversa, setNovaConversa] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimMensagensRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Redireciona se não autenticado ou não for cliente
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (sessao?.user?.role !== 'cliente') router.push('/');
  }, [status, sessao, router]);

  // Carrega threads ao iniciar sessão
  useEffect(() => {
    if (!sessao?.user?.id) return;
    buscarThreads();
  }, [sessao]);

  const buscarThreads = async () => {
    try {
      const res = await fetch('/api/chat/history');
      if (!res.ok) throw new Error('Erro ao carregar conversas');
      const dados = await res.json();
      setThreads(dados);
      if (dados.length > 0 && !threadAtualId && !novaConversa) {
        setThreadAtualId(dados[0].thread_id);
      }
    } catch (err) {
      console.error('Erro ao buscar threads:', err);
    }
  };

  // Carrega mensagens ao trocar de thread
  useEffect(() => {
    if (threadAtualId && !novaConversa) {
      buscarMensagens(threadAtualId);
    } else if (novaConversa) {
      setMensagens([]);
      setErro(null);
    }
  }, [threadAtualId, novaConversa]);

  const buscarMensagens = async (threadId: string) => {
    try {
      const res = await fetch(`/api/chat/thread/${threadId}`);
      if (!res.ok) throw new Error('Erro ao carregar mensagens');
      const dados = await res.json();
      setMensagens(dados);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  };

  const enviarMensagem = async () => {
    if (!input.trim() || carregando) return;

    const textoMensagem = input.trim();
    setInput('');
    setCarregando(true);
    setErro(null);

    // Adiciona mensagem do utilizador imediatamente
    const mensagemTemp: Mensagem = {
      direcao: 'entrada',
      conteudo: textoMensagem,
      criado_em: new Date().toISOString(),
    };
    setMensagens(prev => [...prev, mensagemTemp]);
    rolarParaBaixo();

    // Cancela pedido anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // CORREÇÃO: threadId calculado antes do fetch
    // evita problemas com setState assíncrono
    let threadIdFinal = threadAtualId;
    if (novaConversa || !threadIdFinal) {
      threadIdFinal = `user-${sessao?.user?.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
    }

    // CORREÇÃO: timeout separado do AbortController
    // evita cancelar pedidos futuros acidentalmente
    const timeoutId = setTimeout(() => {
      controller.abort();
      setErro('A resposta está a demorar demasiado. Tente novamente.');
      setCarregando(false);
    }, 30000);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: textoMensagem, threadId: threadIdFinal }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let mensagemErro = 'Erro na resposta do agente';
        try {
          const dadosErro = await res.json();
          mensagemErro = dadosErro.erro || dadosErro.error || mensagemErro;
        } catch (_) { /* ignora */ }
        throw new Error(mensagemErro);
      }

      const dados = await res.json();

      // CORREÇÃO: estado atualizado só após sucesso
      setThreadAtualId(threadIdFinal);
      setNovaConversa(false);

      const mensagemAssistente: Mensagem = {
        direcao: 'saida',
        conteudo: dados.resposta,
        criado_em: new Date().toISOString(),
      };
      setMensagens(prev => [...prev, mensagemAssistente]);
      buscarThreads();

    } catch (err: any) {
      clearTimeout(timeoutId);

      // CORREÇÃO: remove mensagem temporária em caso de erro
      setMensagens(prev => prev.slice(0, -1));

      if (err.name === 'AbortError') {
        setErro('O pedido foi cancelado. Tente novamente.');
      } else {
        console.error('Erro ao enviar mensagem:', err);
        setErro(err.message || 'Erro ao obter resposta. Tente novamente.');
      }
    } finally {
      setCarregando(false);
      rolarParaBaixo();
    }
  };

  const iniciarNovaConversa = () => {
    setThreadAtualId(null);
    setNovaConversa(true);
    setMensagens([]);
    setSidebarAberta(false);
    setErro(null);
  };

  const rolarParaBaixo = () => {
    fimMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSair = () => {
    signOut({ callbackUrl: '/' });
  };

  // Ecrã de carregamento inicial
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep to-teal">
        <div className="flex flex-col items-center gap-3">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-ice rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-ice rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-ice rounded-full animate-bounce delay-200" />
          </div>
          <span className="text-ice text-sm">A carregar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep to-teal">

      {/* Botão menu mobile */}
      <button
        onClick={() => setSidebarAberta(!sidebarAberta)}
        className="fixed top-4 left-4 z-50 md:hidden bg-black/30 backdrop-blur-md p-2 rounded-lg text-ice"
        aria-label={sidebarAberta ? 'Fechar menu' : 'Abrir menu'}
      >
        {sidebarAberta ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex h-screen">

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-40 w-80
            bg-black/30 backdrop-blur-md border-r border-white/20
            transform transition-transform duration-300 ease-in-out
            ${sidebarAberta ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">

            {/* Cabeçalho sidebar */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-ice font-bold text-xl">Conversas</h2>
                <button
                  onClick={iniciarNovaConversa}
                  className="p-2 text-ice hover:text-accent transition"
                  title="Nova conversa"
                >
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>

            {/* Lista de threads */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {threads.length === 0 ? (
                <div className="text-ice/60 text-sm p-4 text-center">
                  Nenhuma conversa anterior.
                </div>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.thread_id}
                    onClick={() => {
                      setThreadAtualId(thread.thread_id);
                      setNovaConversa(false);
                      setSidebarAberta(false);
                      setErro(null);
                    }}
                    className={`
                      w-full text-left p-3 rounded-lg transition
                      ${threadAtualId === thread.thread_id && !novaConversa
                        ? 'bg-accent/20 border border-accent'
                        : 'hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-ice/60 shrink-0" />
                      <span className="text-ice text-sm truncate">
                        {thread.ultima_mensagem?.slice(0, 40) || 'Conversa'}
                      </span>
                    </div>
                    <div className="text-xs text-ice/40 mt-1 pl-6">
                      {new Date(thread.ultima_atividade).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Rodapé sidebar */}
            <div className="p-4 border-t border-white/20">
              <div className="text-ice/40 text-xs mb-3 truncate">
                {sessao?.user?.name || sessao?.user?.email}
              </div>
              <button
                onClick={handleSair}
                className="w-full flex items-center gap-2 p-2 text-ice hover:text-accent transition rounded-lg"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Área principal */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Lista de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm flex items-start gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{erro}</span>
              </div>
            )}

            {/* Estado vazio */}
            {mensagens.length === 0 && !carregando && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-ice/60 space-y-3">
                  <MessageSquare size={48} className="mx-auto opacity-30" />
                  <p className="text-lg font-medium">Como posso ajudar?</p>
                  <p className="text-sm opacity-70">
                    Pergunte sobre o estado da sua viatura, agende um serviço ou tire dúvidas.
                  </p>
                </div>
              </div>
            )}

            {/* Mensagens */}
            {mensagens.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.direcao === 'entrada' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl
                    ${msg.direcao === 'entrada'
                      ? 'bg-accent text-deep rounded-br-sm'
                      : 'bg-white/10 text-ice backdrop-blur-sm rounded-bl-sm'}
                  `}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.conteudo}
                  </p>
                  <div className="text-xs opacity-50 mt-1 text-right">
                    {new Date(msg.criado_em).toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1 items-center h-4">
                    <div className="w-2 h-2 bg-ice/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-ice/60 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-ice/60 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={fimMensagensRef} />
          </div>

          {/* Área de input */}
          <div className="p-4 border-t border-white/20 bg-black/20 backdrop-blur-sm">
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem();
                  }
                }}
                placeholder="Escreva a sua mensagem..."
                disabled={carregando}
                className="
                  flex-1 p-3 bg-white/10 border border-white/30 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-accent
                  text-ice placeholder:text-ice/40
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-sm
                "
              />
              <button
                onClick={enviarMensagem}
                disabled={carregando || !input.trim()}
                className="
                  p-3 bg-accent text-deep rounded-lg
                  hover:bg-orange-500 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shrink-0
                "
                aria-label="Enviar mensagem"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}