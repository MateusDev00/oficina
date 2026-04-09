/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Send, Menu, X, PlusCircle, LogOut, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (sessao?.user?.role !== 'cliente') router.push('/login');
  }, [status, sessao, router]);

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
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  const enviarMensagem = async () => {
    if (!input.trim() || carregando) return;

    const textoMensagem = input.trim();
    setInput('');
    setCarregando(true);
    setErro(null);

    const mensagemTemp: Mensagem = {
      direcao: 'entrada',
      conteudo: textoMensagem,
      criado_em: new Date().toISOString(),
    };
    setMensagens(prev => [...prev, mensagemTemp]);
    rolarParaBaixo();

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let threadIdFinal = threadAtualId;
    if (novaConversa || !threadIdFinal) {
      threadIdFinal = `user-${sessao?.user?.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    const timeoutId = setTimeout(() => {
      controller.abort();
      setErro('A resposta está a demorar demasiado. Tente novamente.');
      setCarregando(false);
    }, 1200000);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: textoMensagem, threadId: threadIdFinal }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let erroMsg = 'Erro na resposta do agente';
        try {
          const dados = await res.json();
          erroMsg = dados.erro || dados.error || erroMsg;
        } catch (_) {}
        throw new Error(erroMsg);
      }

      const dados = await res.json();
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
      setMensagens(prev => prev.slice(0, -1));
      if (err.name === 'AbortError') {
        setErro('O pedido foi cancelado. Tente novamente.');
      } else {
        console.error(err);
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

  const handleSair = () => signOut({ callbackUrl: '/' });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <button
        onClick={() => setSidebarAberta(!sidebarAberta)}
        className="fixed top-4 left-4 z-50 md:hidden bg-surface p-2 rounded-lg shadow-md text-text hover:text-primary transition"
      >
        {sidebarAberta ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-40 w-80 bg-surface/80 backdrop-blur-md border-r border-border
            transform transition-transform duration-300 ease-in-out
            ${sidebarAberta ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">Conversas</h2>
                <button
                  onClick={iniciarNovaConversa}
                  className="p-2 text-text-secondary hover:text-primary transition rounded-lg"
                >
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {threads.length === 0 ? (
                <div className="text-text-secondary text-sm p-4 text-center">
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
                        ? 'bg-primary/20 border border-primary'
                        : 'hover:bg-surface/50'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-text-secondary shrink-0" />
                      <span className="text-text text-sm truncate">
                        {thread.ultima_mensagem?.slice(0, 40) || 'Conversa'}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1 pl-6">
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

            <div className="p-4 border-t border-border">
              <div className="text-text-secondary text-xs mb-3 truncate">
                {sessao?.user?.name || sessao?.user?.email}
              </div>
              <button
                onClick={handleSair}
                className="w-full flex items-center gap-2 p-2 text-text-secondary hover:text-primary transition rounded-lg"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Área principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {erro && (
              <div className="bg-danger/10 border border-danger text-danger p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            {mensagens.length === 0 && !carregando && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-text-secondary space-y-3">
                  <MessageSquare size={48} className="mx-auto opacity-30" />
                  <p className="text-lg font-medium">Como posso ajudar?</p>
                  <p className="text-sm opacity-70">
                    Pergunte sobre o estado da sua viatura, agende um serviço ou tire dúvidas.
                  </p>
                </div>
              </div>
            )}

            {mensagens.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.direcao === 'entrada' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl
                    ${msg.direcao === 'entrada'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-surface text-text rounded-bl-sm'}
                  `}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.conteudo}
                  </p>
                  <div className="text-xs opacity-60 mt-1 text-right">
                    {new Date(msg.criado_em).toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {carregando && (
              <div className="flex justify-start">
                <div className="bg-surface rounded-2xl rounded-bl-sm p-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              </div>
            )}

            <div ref={fimMensagensRef} />
          </div>

          <div className="p-4 border-t border-border bg-surface/50">
            <div className="flex gap-2 items-end">
              <textarea
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
                rows={1}
                className="flex-1 p-3 bg-dark-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text placeholder:text-text-secondary resize-none"
              />
              <button
                onClick={enviarMensagem}
                disabled={carregando || !input.trim()}
                className="p-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
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