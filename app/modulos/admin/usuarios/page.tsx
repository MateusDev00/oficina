'use client';
import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Search, X, User, Shield, Wrench } from 'lucide-react';

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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', papel: 'cliente', especialidade: '', password: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/admin/usuarios');
      if (!res.ok) throw new Error('Erro ao carregar utilizadores');
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
      if (!res.ok) throw new Error('Erro ao salvar');
      setModalOpen(false);
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar utilizador');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ nome: '', email: '', telefone: '', papel: 'cliente', especialidade: '', password: '' });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      fetchUsuarios();
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir utilizador');
    }
  };

  // Filter and pagination
  const filtered = usuarios.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.telefone.includes(search)
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleIcon = (role: string) => {
    if (role === 'administrador') return <Shield size={18} className="text-primary" />;
    if (role === 'tecnico') return <Wrench size={18} className="text-success" />;
    return <User size={18} className="text-gray-400" />;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Utilizadores</h1>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Novo Utilizador
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 card p-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="bg-transparent flex-1 outline-none text-gray-700"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 text-gray-500 text-sm">
            <tr><th className="pb-2">Nome</th><th className="pb-2">Email</th><th className="pb-2">Telefone</th><th className="pb-2">Papel</th><th className="pb-2">Ações</th></tr>
          </thead>
          <tbody>
            {paginated.map(user => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 flex items-center gap-2">{getRoleIcon(user.papel)} {user.nome}</td>
                <td className="text-gray-600">{user.email}</td>
                <td className="text-gray-600">{user.telefone}</td>
                <td>
                  <span className={`badge ${user.papel === 'administrador' ? 'badge-primary' : user.papel === 'tecnico' ? 'badge-success' : 'badge-warning'}`}>
                    {user.papel}
                  </span>
                </td>
                <td className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(user.id); setFormData({ nome: user.nome, email: user.email, telefone: user.telefone, papel: user.papel, especialidade: user.especialidade || '', password: '' }); setModalOpen(true); }}
                    className="text-gray-400 hover:text-primary transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(user.id)}
                    className="text-gray-400 hover:text-danger transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-gray-400">Nenhum utilizador encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-gray-600">Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Utilizador' : 'Novo Utilizador'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="input w-full" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input w-full" required />
              <input type="tel" placeholder="Telefone (+244...)" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} className="input w-full" required />
              <select value={formData.papel} onChange={e => setFormData({ ...formData, papel: e.target.value })} className="input w-full">
                <option value="cliente">Cliente</option>
                <option value="tecnico">Técnico</option>
                <option value="administrador">Administrador</option>
              </select>
              {formData.papel === 'tecnico' && (
                <input type="text" placeholder="Especialidade" value={formData.especialidade} onChange={e => setFormData({ ...formData, especialidade: e.target.value })} className="input w-full" />
              )}
              {!editingId && (
                <input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input w-full" required />
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-4">Tem certeza que deseja excluir este utilizador? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-danger text-white rounded hover:bg-danger/90">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}