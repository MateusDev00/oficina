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
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-30"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/70 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-12 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">LPN</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Oficina LPN</h1>
          </div>

          <nav className="flex gap-6 items-center">
            {['sobre', 'servicos', 'especializacoes'].map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-gray-700 hover:text-primary transition font-medium ${activeSection === id ? 'text-primary border-b-2 border-primary' : ''}`}
              >
                {id === 'sobre' ? 'Sobre' : id === 'servicos' ? 'Serviços' : 'Especializações'}
              </button>
            ))}
            <div className="flex gap-3 ml-4">
              <Link href="/login">
                <button className="px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition">
                  Entrar
                </button>
              </Link>
              <Link href="/registrar">
                <button className="px-5 py-2 rounded-full bg-primary text-white shadow-md hover:bg-primary-hover transition">
                  Criar Conta
                </button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section id="sobre" className="text-center py-20 md:py-32">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800 drop-shadow-sm">
            Excelência em Manutenção Automotiva
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Há mais de 10 anos oferecendo soluções completas para o seu veículo. Tecnologia, qualidade e confiança.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registrar">
              <button className="btn-primary px-8 py-3 text-lg flex items-center gap-2">
                Agendar Serviço <ChevronRight size={20} />
              </button>
            </Link>
            <button
              onClick={() => scrollToSection('servicos')}
              className="btn-outline px-8 py-3 text-lg"
            >
              Conheça nossos serviços
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center text-gray-800">Nossos Serviços</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="card p-6 hover:shadow-lg transition">
                <div className="text-primary mb-4">{service.icon}</div>
                <h4 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h4>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Specializations Section */}
        <section id="especializacoes" className="mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center text-gray-800">Nossas Especializações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec, idx) => (
              <div key={idx} className="card p-6 flex items-start gap-4">
                <div className="text-primary text-3xl">{spec.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{spec.name}</h4>
                  <p className="text-gray-600 text-sm">{spec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-20 text-center card p-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
            Pronto para cuidar do seu veículo com quem entende?
          </h3>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Junte-se a centenas de clientes satisfeitos e experimente a diferença de um atendimento profissional.
          </p>
          <Link href="/registrar">
            <button className="btn-primary px-8 py-3 text-lg">
              Solicitar orçamento
            </button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
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