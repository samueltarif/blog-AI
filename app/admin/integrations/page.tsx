'use client';
import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Webhook, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const q = query(collection(db, 'integrations'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIntegrations(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'integrations'), {
        name: newName,
        url: newUrl,
        isActive: true,
        createdAt: new Date().toISOString(),
        authorId: user.uid,
      });
      setNewName('');
      setNewUrl('');
      setIsAdding(false);
      fetchIntegrations();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'integrations');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'integrations', id), { isActive: !currentStatus });
      fetchIntegrations();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'integrations');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta integração?')) return;
    try {
      await deleteDoc(doc(db, 'integrations', id));
      fetchIntegrations();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'integrations');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Integrações (Webhooks)</h1>
          <p className="text-zinc-500">Envie seus posts automaticamente para outros sites, como WordPress, Medium, ou APIs personalizadas.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Nova Integração
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Adicionar Webhook</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Sistema (ex: Meu WordPress)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">URL do Webhook</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://meusite.com/api/receber-post"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-colors">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {integrations.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Webhook className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p>Nenhuma integração configurada ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {integrations.map((integration) => (
              <li key={integration.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${integration.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Webhook className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{integration.name}</h3>
                    <p className="text-sm text-zinc-500 font-mono mt-1">{integration.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(integration.id, integration.isActive)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${integration.isActive ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'}`}
                  >
                    {integration.isActive ? <><CheckCircle2 className="w-4 h-4" /> Ativo</> : <><XCircle className="w-4 h-4" /> Inativo</>}
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
