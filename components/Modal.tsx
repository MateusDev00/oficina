'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-deep rounded-2xl w-full max-w-md p-6 border border-white/20">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-ice/70 hover:text-ice">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}