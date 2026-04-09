'use client';
import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Search, X } from 'lucide-react';

interface Tecnico {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  disponivel: boolean;
}

export default function AdminTecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', especialidade: '', disponivel: true, password: '' });

  const fetchTecnicos = async () => {
    try {
      const res = await fetch('/api/admin/tecnicos');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTecnicos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTecnicos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/tecnicos/${editingId}` : '/api/admin/tecnicos';
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? formData : { ...formData, password: formData.password };
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      setModalOpen(false);
      setEditingId(null);
      setFormData({ nome: '', email: '', telefone: '', especialidade: '', disponivel: true, password: '' });
      fetchTecnicos();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir técnico?')) return;
    await fetch(`/api/admin/tecnicos/${id}`, { method: 'DELETE' });
    fetchTecnicos();
  };

  const toggleDisponivel = async (id: number, current: boolean) => {
    await fetch(`/api/admin/tecnicos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disponivel: !current }) });
    fetchTecnicos();
  };

  const filtered = tecnicos.filter(t => t.nome.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-ice">Gestão de Técnicos</h1>
        <button onClick={() => { setEditingId(null); setFormData({ nome: '', email: '', telefone: '', especialidade: '', disponivel: true, password: '' }); setModalOpen(true); }} className="flex items-center gap-2 bg-accent text-deep px-4 py-2 rounded-lg hover:bg-orange-500 transition"><Plus size={18} /> Novo Técnico</button>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/20">
        <Search size={18} className="text-ice/60" />
        <input type="text" placeholder="Buscar técnico..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent flex-1 outline-none text-ice placeholder:text-ice/50" />
        {search && <button onClick={() => setSearch('')} className="text-ice/60 hover:text-ice"><X size={16} /></button>}
      </div>

      {loading ? <div className="text-ice text-center py-12">A carregar...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/20 text-ice/70 text-sm"><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Especialidade</th><th>Disponível</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 text-ice">{t.nome}</td>
                  <td className="py-3 text-ice/80">{t.email}</td>
                  <td className="py-3 text-ice/80">{t.telefone}</td>
                  <td className="py-3 text-ice/80">{t.especialidade}</td>
                  <td className="py-3"><button onClick={() => toggleDisponivel(t.id, t.disponivel)} className={`px-2 py-1 rounded-full text-xs ${t.disponivel ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{t.disponivel ? 'Disponível' : 'Indisponível'}</button></td>
                  <td className="py-3 flex gap-2"><button onClick={() => { setEditingId(t.id); setFormData({ nome: t.nome, email: t.email, telefone: t.telefone, especialidade: t.especialidade, disponivel: t.disponivel, password: '' }); setModalOpen(true); }} className="text-ice/70 hover:text-accent"><Edit size={18} /></button><button onClick={() => handleDelete(t.id)} className="text-ice/70 hover:text-red-400"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-deep rounded-2xl w-full max-w-md p-6 border border-white/20">
            <h2 className="text-xl font-bold text-ice mb-4">{editingId ? 'Editar Técnico' : 'Novo Técnico'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              <input type="tel" placeholder="Telefone (+244...)" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />
              <input type="text" placeholder="Especialidade" value={formData.especialidade} onChange={e => setFormData({ ...formData, especialidade: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" />
              <div className="flex items-center gap-2"><input type="checkbox" checked={formData.disponivel} onChange={e => setFormData({ ...formData, disponivel: e.target.checked })} /><span className="text-ice">Disponível</span></div>
              {!editingId && <input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice" required />}
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-ice/70 hover:text-ice">Cancelar</button><button type="submit" className="px-4 py-2 bg-accent text-deep rounded-lg hover:bg-orange-500 transition">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}