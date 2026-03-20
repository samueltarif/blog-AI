'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, Plus, Webhook, Loader2 } from 'lucide-react';
import { dispatchWebhooks } from '@/lib/webhook-utils';

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      await deleteDoc(doc(db, 'posts', id));
    }
  };

  const handleDispatch = async (post: any) => {
    if (confirm('Deseja enviar este post para todas as integrações ativas?')) {
      setDispatchingId(post.id);
      await dispatchWebhooks(post);
      alert('Post enviado para as integrações!');
      setDispatchingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Gerenciar Posts</h1>
          <p className="text-zinc-500">Visualize e edite todos os seus posts do blog.</p>
        </div>
        <Link href="/admin/posts/new" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Post
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-4 font-medium text-zinc-500">Título</th>
                <th className="p-4 font-medium text-zinc-500">Status</th>
                <th className="p-4 font-medium text-zinc-500">Criado em</th>
                <th className="p-4 font-medium text-zinc-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-medium text-zinc-900">{post.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600' : post.status === 'scheduled' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-600'}`}>
                      {post.status === 'published' ? 'publicado' : post.status === 'scheduled' ? 'agendado' : 'rascunho'}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500 text-sm">{format(new Date(post.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {post.status === 'published' && (
                      <button 
                        onClick={() => handleDispatch(post)} 
                        disabled={dispatchingId === post.id}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Enviar para Integrações"
                      >
                        {dispatchingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
                      </button>
                    )}
                    <Link href={`/admin/posts/${post.id}/edit`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
