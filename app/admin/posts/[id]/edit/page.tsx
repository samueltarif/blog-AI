'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { dispatchWebhooks } from '@/lib/webhook-utils';
import { Loader2, Save } from 'lucide-react';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setBody(data.body || '');
          setExcerpt(data.excerpt || '');
          setCoverImageUrl(data.coverImageUrl || '');
          setStatus(data.status || 'draft');
          if (data.scheduledAt) setScheduledAt(data.scheduledAt.slice(0, 16));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  const handleSave = async () => {
    if (!user || !params.id) return;
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const postData = {
        title, body, excerpt, coverImageUrl,
        status,
        publishedAt: status === 'published' ? now : null,
        scheduledAt: status === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
        updatedAt: now,
      };
      await updateDoc(doc(db, 'posts', params.id as string), postData);
      
      if (status === 'published') {
        await dispatchWebhooks({ id: params.id as string, ...postData });
      }
      
      router.push('/admin/posts');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'posts');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8"><h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Editar Post</h1></header>
      
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 space-y-6">
          <div><label className="block text-sm font-medium text-zinc-700 mb-2">Título</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-zinc-700 mb-2">Resumo</label><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24" /></div>
          <div><label className="block text-sm font-medium text-zinc-700 mb-2">Corpo (Markdown)</label><textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-96 font-mono text-sm" /></div>
          <div><label className="block text-sm font-medium text-zinc-700 mb-2">URL da Imagem de Capa</label><input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          {coverImageUrl && <div className="aspect-video w-full rounded-xl overflow-hidden"><img src={coverImageUrl} alt="Capa" className="w-full h-full object-cover" /></div>}
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="draft">Rascunho</option><option value="scheduled">Agendado</option><option value="published">Publicado</option>
            </select>
            {status === 'scheduled' && <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />}
          </div>
          <button onClick={handleSave} disabled={isProcessing || !title || !body} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-all">
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
          </button>
        </div>
      </div>
    </div>
  );
}
