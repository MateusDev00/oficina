/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Search, X } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  papel: string;
  especialidade?: string;
  disponivel?: boolean;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    papel: 'cliente',
    especialidade: '',
    password: '',
  });

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/admin/usuarios');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/usuarios/${editingId}` : '/api/admin/usuarios';
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? formData : { ...formData, password: formData.password };
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setModalOpen(false);
      setEditingId(null);
      setFormData({ nome: '', email: '', telefone: '', papel: 'cliente', especialidade: '', password: '' });
      fetchUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este utilizador?')) return;
    try {
      await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
      fetchUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = usuarios.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.telefone.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-ice">Gestão de Utilizadores</h1>
        <button
          onClick={() => { setEditingId(null); setFormData({ nome: '', email: '', telefone: '', papel: 'cliente', especialidade: '', password: '' }); setModalOpen(true); }}
          className="flex items-center gap-2 bg-accent text-deep px-4 py-2 rounded-lg hover:bg-orange-500 transition"
        >
          <Plus size={18} /> Novo Utilizador
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/20">
        <Search size={18} className="text-ice/60" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent flex-1 outline-none text-ice placeholder:text-ice/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-ice/60 hover:text-ice">
            <X size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-ice text-center py-12">A carregar...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/20 text-ice/70 text-sm">
              <tr>
                <th className="pb-2">Nome</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Telefone</th>
                <th className="pb-2">Papel</th>
                <th className="pb-2">Especialidade</th>
                <th className="pb-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 text-ice">{user.nome}</td>
                  <td className="py-3 text-ice/80">{user.email}</td>
                  <td className="py-3 text-ice/80">{user.telefone}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.papel === 'administrador' ? 'bg-accent/20 text-accent' : user.papel === 'tecnico' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                      {user.papel === 'administrador' ? 'Admin' : user.papel === 'tecnico' ? 'Técnico' : 'Cliente'}
                    </span>
                  </td>
                  <td className="py-3 text-ice/80">{user.especialidade || '-'}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => { setEditingId(user.id); setFormData({ nome: user.nome, email: user.email, telefone: user.telefone, papel: user.papel, especialidade: user.especialidade || '', password: '' }); setModalOpen(true); }} className="text-ice/70 hover:text-accent"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(user.id)} className="text-ice/70 hover:text-red-400"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-deep rounded-2xl w-full max-w-md p-6 border border-white/20">
            <h2 className="text-xl font-bold text-ice mb-4">{editingId ? 'Editar Utilizador' : 'Novo Utilizador'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              <input type="tel" placeholder="Telefone (+244...)" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              <select value={formData.papel} onChange={e => setFormData({ ...formData, papel: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice">
                <option value="cliente">Cliente</option>
                <option value="tecnico">Técnico</option>
                <option value="administrador">Administrador</option>
              </select>
              {formData.papel === 'tecnico' && (
                <input type="text" placeholder="Especialidade (ex: Mecânica)" value={formData.especialidade} onChange={e => setFormData({ ...formData, especialidade: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" />
              )}
              {!editingId && (
                <input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-ice/70 hover:text-ice">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-accent text-deep rounded-lg hover:bg-orange-500 transition">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}