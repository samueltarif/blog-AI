'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, LayoutDashboard, FileText, ListOrdered, Webhook } from 'lucide-react';
import QueueProcessor from '@/components/queue-processor';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && (!user || !isAdmin) && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router, isLoginPage]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="flex h-screen bg-zinc-50">
      <QueueProcessor />
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-xl font-display font-bold text-zinc-900">Admin CMS</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Painel
          </Link>
          <Link href="/admin/posts" className="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl font-medium transition-colors">
            <FileText className="w-5 h-5" /> Posts
          </Link>
          <Link href="/admin/queue" className="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl font-medium transition-colors">
            <ListOrdered className="w-5 h-5" /> Fila Automática
          </Link>
          <Link href="/admin/integrations" className="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl font-medium transition-colors">
            <Webhook className="w-5 h-5" /> Integrações
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-200">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 rounded-xl font-medium transition-colors w-full text-left">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
