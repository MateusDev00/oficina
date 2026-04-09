/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ChunkInfo {
  id: number;
  titulo: string;
  metadata: any;
  preview: string;
}

export default function AdminDocumentosPage() {
  const [documentos, setDocumentos] = useState<ChunkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Carregar todos os chunks agrupados por título
  const fetchDocumentos = async () => {
    try {
      const res = await fetch('/api/admin/documentos');
      if (!res.ok) throw new Error('Erro ao carregar documentos');
      const data = await res.json();
      setDocumentos(data);
    } catch (error) {
      console.error(error);
      setUploadStatus({ type: 'error', message: 'Falha ao carregar documentos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, []);

  // Upload de PDF
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const titulo = formData.get('titulo') as string;

    if (!file || !titulo) {
      setUploadStatus({ type: 'error', message: 'Preencha o título e selecione um ficheiro PDF.' });
      return;
    }
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Apenas ficheiros PDF são permitidos.' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('titulo', titulo);

    try {
      const res = await fetch('/api/admin/documentos', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload');
      setUploadStatus({ type: 'success', message: `"${titulo}" indexado com ${data.chunks} chunks.` });
      (e.target as HTMLFormElement).reset();
      fetchDocumentos();
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  // Remover documento (todos os chunks com o mesmo título)
  const handleDelete = async (titulo: string) => {
    if (!confirm(`Remover "${titulo}"? Todos os chunks serão apagados.`)) return;
    setDeleting(titulo);
    try {
      const res = await fetch(`/api/admin/documentos?titulo=${encodeURIComponent(titulo)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover');
      setUploadStatus({ type: 'success', message: `"${titulo}" removido.` });
      fetchDocumentos();
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: error.message });
    } finally {
      setDeleting(null);
    }
  };

  // Agrupar chunks por título para exibição
  const grouped = documentos.reduce((acc, chunk) => {
    const titulo = chunk.titulo || 'Sem título';
    if (!acc[titulo]) acc[titulo] = [];
    acc[titulo].push(chunk);
    return acc;
  }, {} as Record<string, ChunkInfo[]>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📄 Gestão de Documentos</h1>
      <p className="text-gray-600">
        Envie PDFs para alimentar a base de conhecimento do agente inteligente. O conteúdo será processado e indexado para consultas RAG.
      </p>

      {/* Formulário de upload */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} className="text-primary" /> Novo Documento
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              name="titulo"
              required
              className="input w-full"
              placeholder="Ex: Manual de Reparação - Motor 1.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ficheiro (PDF)</label>
            <input
              type="file"
              name="file"
              accept=".pdf"
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
            />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Indexando...' : 'Enviar e Indexar'}
          </button>
        </form>
      </div>

      {/* Mensagem de status */}
      {uploadStatus && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {uploadStatus.message}
        </div>
      )}

      {/* Lista de documentos indexados */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Documentos Indexados
          </h2>
          <button onClick={fetchDocumentos} className="btn-outline flex items-center gap-1 text-sm">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum documento indexado. Envie o primeiro PDF.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([titulo, chunks]) => (
              <div key={titulo} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{titulo}</h3>
                    <p className="text-sm text-gray-500">{chunks.length} chunks indexados</p>
                    <div className="mt-1 text-xs text-gray-400 space-y-1">
                      {chunks.slice(0, 2).map(chunk => (
                        <div key={chunk.id} className="truncate max-w-md">{chunk.preview}…</div>
                      ))}
                      {chunks.length > 2 && <div>+ {chunks.length - 2} mais</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(titulo)}
                    disabled={deleting === titulo}
                    className="text-gray-400 hover:text-danger transition disabled:opacity-50"
                    title="Remover documento"
                  >
                    {deleting === titulo ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}