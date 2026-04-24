'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export default function NotificacaoSinoTecnico() {
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    const fetchNotificacoes = async () => {
      try {
        const res = await fetch('/api/tecnico/notificacoes?naoLidas=true');
        const data = await res.json();
        setNaoLidas(data.total || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Link href="/modulos/tecnico/notificacoes" className="relative block">
        <Bell className="w-6 h-6 text-ice hover:text-accent transition" />
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-2 bg-accent text-deep text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </Link>
    </div>
  );
}