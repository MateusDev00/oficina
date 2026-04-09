'use client';
import { X } from 'lucide-react';

export default function SidebarCloseButton() {
  const close = () => {
    document.getElementById('sidebar')?.classList.toggle('translate-x-0');
  };
  return (
    <button onClick={close} className="text-ice">
      <X size={24} />
    </button>
  );
}