'use client';
import { X } from 'lucide-react';

export default function SidebarCloseButton() {
  return (
    <button
      onClick={() => document.getElementById('sidebar')?.classList.toggle('translate-x-0')}
      className="text-gray-500 hover:text-gray-700"
    >
      <X size={24} />
    </button>
  );
}