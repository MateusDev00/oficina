'use client';
import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Search, X, Wrench, CheckCircle, XCircle } from 'lucide-react';

interface Tecnico {
  id: number; nome: string; email: string; telefone: string; especialidade: string; disponivel: boolean;
}

export default function AdminTecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', especialidade: '', disponivel: true, password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchTecnicos = async () => {
    try {
      const res = await fetch('/api/admin/tecnicos');
      if (!res.ok) throw new Error('Erro ao carregar técnicos');
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
      if (!res.ok) throw new Error('Erro ao salvar');
      setModalOpen(false); resetForm(); fetchTecnicos();
    } catch (error) { console.error(error); alert('Erro ao salvar técnico'); }
  };

  const resetForm = () => { setEditingId(null); setFormData({ nome: '', email: '', telefone: '', especialidade: '', disponivel: true, password: '' }); };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/tecnicos/${id}`, { method: 'DELETE' });
      fetchTecnicos(); setDeleteConfirm(null);
    } catch (error) { console.error(error); alert('Erro ao excluir técnico'); }
  };

  const toggleDisponivel = async (id: number, current: boolean) => {
    try {
      await fetch(`/api/admin/tecnicos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disponivel: !current }) });
      fetchTecnicos();
    } catch (error) { console.error(error); }
  };

  const filtered = tecnicos.filter(t => t.nome.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Técnicos</h1>
        <button onClick={() => { resetForm(); setModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Técnico</button>
      </div>

      <div className="mb-4 flex items-center gap-2 card p-2">
        <Search size={18} className="text-gray-400" />
        <input type="text" placeholder="Buscar técnico..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="bg-transparent flex-1 outline-none text-gray-700" />
        {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 text-gray-500 text-sm"><tr><th className="pb-2">Nome</th><th className="pb-2">Email</th><th className="pb-2">Especialidade</th><th className="pb-2">Disponível</th><th className="pb-2">Ações</th></tr></thead>
          <tbody>
            {paginated.map(t => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 flex items-center gap-2"><Wrench size={18} className="text-primary" /> {t.nome}</td>
                <td className="text-gray-600">{t.email}</td>
                <td className="text-gray-600">{t.especialidade || '-'}</td>
                <td>
                  <button onClick={() => toggleDisponivel(t.id, t.disponivel)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${t.disponivel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.disponivel ? <CheckCircle size={14} /> : <XCircle size={14} />} {t.disponivel ? 'Disponível' : 'Indisponível'}
                  </button>
                </td>
                <td className="flex gap-2">
                  <button onClick={() => { setEditingId(t.id); setFormData({ nome: t.nome, email: t.email, telefone: t.telefone, especialidade: t.especialidade, disponivel: t.disponivel, password: '' }); setModalOpen(true); }} className="text-gray-400 hover:text-primary"><Edit size={18} /></button>
                  <button onClick={() => setDeleteConfirm(t.id)} className="text-gray-400 hover:text-danger"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Anterior</button>
          <span className="px-3 py-1 text-gray-600">Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Próxima</button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Técnico' : 'Novo Técnico'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="input w-full" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input w-full" required />
              <input type="tel" placeholder="Telefone" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="input w-full" required />
              <input type="text" placeholder="Especialidade" value={formData.especialidade} onChange={e => setFormData({...formData, especialidade: e.target.value})} className="input w-full" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.disponivel} onChange={e => setFormData({...formData, disponivel: e.target.checked})} /> <span className="text-gray-700">Disponível</span></label>
              {!editingId && <input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input w-full" required />}
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-4">Tem certeza que deseja excluir este técnico?</p>
            <div className="flex justify-center gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded">Cancelar</button><button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-danger text-white rounded">Excluir</button></div>
          </div>
        </div>
      )}
    </div>
  );
}