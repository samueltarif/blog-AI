'use client';
import Link from 'next/link';
import { FileText, Plus, ListOrdered } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Painel</h1>
        <p className="text-zinc-500">Bem-vindo ao CMS da Plataforma de Blog com IA.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/posts/new" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-1">Novo Post</h2>
          <p className="text-sm text-zinc-500">Crie um novo post no blog manualmente ou com IA.</p>
        </Link>
        
        <Link href="/admin/posts" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-1">Gerenciar Posts</h2>
          <p className="text-sm text-zinc-500">Visualize, edite e publique seus posts existentes.</p>
        </Link>
        
        <Link href="/admin/queue" className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ListOrdered className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-1">Fila Automática</h2>
          <p className="text-sm text-zinc-500">Gerencie a geração automatizada de conteúdo com IA.</p>
        </Link>
      </div>
    </div>
  );
}
