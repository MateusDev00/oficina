'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
    document.getElementById('sidebar')?.classList.toggle('translate-x-0');
  };

  return (
    <button
      onClick={toggle}
      className="lg:hidden fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-md p-2 rounded-lg text-ice"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}