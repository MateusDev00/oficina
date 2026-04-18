'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Car, Wrench, Wind, Battery, Zap, Activity, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((section) => observerRef.current?.observe(section));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vídeo de fundo com overlay escuro */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-40"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-deep/80 to-teal/80 z-10" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 container mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-12 pb-4 border-b border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-deep font-bold text-xl">LPN</span>
            </div>
            <h1 className="text-2xl font-bold text-ice">Oficina LPN</h1>
          </div>

          <nav className="flex gap-6 items-center">
            {['sobre', 'servicos', 'especializacoes'].map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-ice hover:text-accent transition font-medium ${activeSection === id ? 'text-accent border-b-2 border-accent' : ''}`}
              >
                {id === 'sobre' ? 'Sobre' : id === 'servicos' ? 'Serviços' : 'Especializações'}
              </button>
            ))}
            <div className="flex gap-3 ml-4">
              <Link href="/login">
                <button className="px-5 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-deep transition">
                  Entrar
                </button>
              </Link>
              <Link href="/registrar">
                <button className="px-5 py-2 rounded-full bg-accent text-deep shadow-lg hover:bg-orange-500 transition">
                  Criar Conta
                </button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Secção Hero */}
        <section id="sobre" className="text-center py-20 md:py-32">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-ice drop-shadow-lg">
            Excelência em Manutenção Automotiva
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-ice/90 drop-shadow-md">
            Há mais de 10 anos oferecendo soluções completas para o seu veículo. Tecnologia, qualidade e confiança.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registrar">
              <button className="bg-accent text-deep px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition flex items-center gap-2">
                Agendar Serviço <ChevronRight size={20} />
              </button>
            </Link>
            <button
              onClick={() => scrollToSection('servicos')}
              className="border border-accent text-accent px-8 py-3 rounded-full font-bold hover:bg-accent hover:text-deep transition"
            >
              Conheça nossos serviços
            </button>
          </div>
        </section>

        {/* Secção Serviços */}
        <section id="servicos" className="mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center text-ice">Nossos Serviços</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-black/60 transition">
                <div className="text-accent mb-4">{service.icon}</div>
                <h4 className="text-xl font-semibold mb-2 text-ice">{service.title}</h4>
                <p className="text-ice/80">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Secção Especializações */}
        <section id="especializacoes" className="mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center text-ice">Nossas Especializações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex items-start gap-4">
                <div className="text-3xl">{spec.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-ice">{spec.name}</h4>
                  <p className="text-ice/70 text-sm">{spec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <div className="mt-20 text-center bg-black/40 backdrop-blur-md rounded-3xl p-10 border border-white/20">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-ice drop-shadow-md">
            Pronto para cuidar do seu veículo com quem entende?
          </h3>
          <p className="text-ice/80 max-w-xl mx-auto mb-6">
            Junte-se a centenas de clientes satisfeitos e experimente a diferença de um atendimento profissional.
          </p>
          <Link href="/registrar">
            <button className="bg-accent text-deep px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition shadow-lg">
              Solicitar orçamento
            </button>
          </Link>
        </div>

        {/* Rodapé */}
        <footer className="mt-16 pt-8 border-t border-white/20 text-center text-ice/60 text-sm">
          <p>© 2026 Oficina LPN Comercial — Excelência em Manutenção Automotiva</p>
          <p className="mt-2">Uíge, Angola | Atendimento personalizado e tecnologia de ponta</p>
        </footer>
      </div>
    </div>
  );
}

const services = [
  { icon: <Wrench size={32} />, title: "Revisão Completa", description: "Inspeção detalhada de todos os sistemas do veículo." },
  { icon: <Car size={32} />, title: "Mecânica Geral", description: "Reparações de motor, transmissão, suspensão e freios." },
  { icon: <Wind size={32} />, title: "Ar Condicionado", description: "Diagnóstico, carga de gás e reparação de AC automotivo." },
  { icon: <Zap size={32} />, title: "Elétrica e Eletrônica", description: "Sistemas elétricos, injeção eletrônica e scanner avançado." },
  { icon: <Activity size={32} />, title: "Pneus e Alinhamento", description: "Venda, montagem, balanceamento e alinhamento." },
  { icon: <Battery size={32} />, title: "Diagnóstico Digital", description: "Uso de equipamentos de última geração para identificar falhas." },
];

const specializations = [
  { icon: "🚗", name: "Veículos Nacionais", desc: "Experiência com marcas como Toyota, Hyundai, Kia, etc." },
  { icon: "🏎️", name: "Importados de Luxo", desc: "Especialistas em BMW, Mercedes, Audi e outras." },
  { icon: "🔋", name: "Híbridos e Elétricos", desc: "Manutenção de veículos de nova geração." },
  { icon: "🏍️", name: "Motocicletas", desc: "Serviços completos para motos de todas as cilindradas." },
  { icon: "🛻", name: "Caminhões e Utilitários", desc: "Manutenção pesada e revisão de frotas." },
  { icon: "🧰", name: "Injeção Eletrônica", desc: "Programação, recalibração e diagnóstico." },
];