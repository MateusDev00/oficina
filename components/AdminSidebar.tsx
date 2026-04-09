'use client';
import Link from 'next/link';
import { LogOut, LayoutDashboard, Users, Wrench, ClipboardList } from 'lucide-react';
import SidebarCloseButton from './SidebarCloseButton';

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  return (
    <aside
      id="sidebar"
      className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-black/30 backdrop-blur-md min-h-screen p-6 border-r border-white/20 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out"
    >
      <div className="flex justify-end lg:hidden mb-4">
        <SidebarCloseButton />
      </div>
      <div className="mb-8">
        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
          <span className="text-deep font-bold text-xl">LPN</span>
        </div>
        <h2 className="text-xl font-bold text-ice">Olá, {userName}</h2>
        <p className="text-ice/60 text-sm">Administrador</p>
      </div>
      <nav className="space-y-2">
        <Link href="/modulos/admin/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/modulos/admin/usuarios" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
          <Users size={20} /> Utilizadores
        </Link>
        <Link href="/modulos/admin/tecnicos" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
          <Wrench size={20} /> Técnicos
        </Link>
        <Link href="/modulos/admin/ordens" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
          <ClipboardList size={20} /> Ordens
        </Link>
      </nav>
      <div className="absolute bottom-6 left-6">
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="flex items-center gap-2 text-ice/70 hover:text-accent transition">
            <LogOut size={20} /> Sair
          </button>
        </form>
      </div>
    </aside>
  );
}