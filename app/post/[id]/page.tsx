'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!post) return <div className="text-center py-20 text-zinc-500">Post não encontrado.</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-8 inline-block">&larr; Voltar para a Home</Link>
      
      <article>
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-zinc-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-zinc-500 gap-4">
            {post.publishedAt && <time>{format(new Date(post.publishedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</time>}
            {post.aiGenerated && <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">Gerado por IA</span>}
          </div>
        </header>
        
        {post.coverImageUrl && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-10">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="prose prose-lg prose-indigo max-w-none">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
