import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export default function PostCard({ post }: { post: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-zinc-100 hover:shadow-md transition-shadow"
    >
      <Link href={`/post/${post.id}`}>
        {post.coverImageUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-xl font-bold font-display text-zinc-900 mb-2 line-clamp-2">{post.title}</h2>
          <p className="text-zinc-600 mb-4 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>{post.publishedAt ? format(new Date(post.publishedAt), "d 'de' MMM, yyyy", { locale: ptBR }) : ''}</span>
            {post.aiGenerated && <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium">Gerado por IA</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
