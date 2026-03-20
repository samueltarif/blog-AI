'use client';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash2, Loader2, Clock } from 'lucide-react';

export default function QueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [context, setContext] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'topic_queue'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !scheduledAt) return;
    setIsAdding(true);
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'topic_queue'), {
        topic, tone, context,
        status: 'pending',
        scheduledAt: new Date(scheduledAt).toISOString(),
        createdAt: now,
        authorId: user.uid
      });
      setTopic(''); setContext(''); setScheduledAt('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'topic_queue');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este tópico da fila?')) {
      await deleteDoc(doc(db, 'topic_queue', id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-8"><h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Fila Automática</h1><p className="text-zinc-500">Agende tópicos para geração automatizada com IA.</p></header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Adicionar à Fila</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-zinc-700 mb-2">Tópico</label><input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-2">Tom</label><select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"><option>Profissional</option><option>Conversacional</option><option>Educacional</option></select></div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-2">Contexto Adicional (Opcional)</label><textarea value={context} onChange={(e) => setContext(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24" /></div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-2">Agendar Para</label><input type="datetime-local" required value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <button type="submit" disabled={isAdding || !topic || !scheduledAt} className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Adicionar à Fila</>}
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200"><th className="p-4 font-medium text-zinc-500">Tópico</th><th className="p-4 font-medium text-zinc-500">Status</th><th className="p-4 font-medium text-zinc-500">Agendado Para</th><th className="p-4 font-medium text-zinc-500 text-right">Ações</th></tr>
                </thead>
                <tbody>
                  {queue.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-zinc-500">A fila está vazia.</td></tr> : queue.map(item => (
                    <tr key={item.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-medium text-zinc-900">{item.topic}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : item.status === 'processing' ? 'bg-indigo-50 text-indigo-600' : item.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {item.status === 'completed' ? 'concluído' : item.status === 'processing' ? 'processando' : item.status === 'failed' ? 'falhou' : 'pendente'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> {format(new Date(item.scheduledAt), "d 'de' MMM, yyyy HH:mm", { locale: ptBR })}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
