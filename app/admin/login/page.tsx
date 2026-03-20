'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLogin() {
  const { user, isAdmin, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 max-w-md w-full text-center">
        <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Login Admin</h1>
        <p className="text-zinc-500 mb-8">Faça login com sua conta de administrador para acessar o CMS.</p>
        
        {user && !isAdmin && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
            Você não tem privilégios de administrador. Por favor, faça login com uma conta autorizada.
          </div>
        )}
        
        <button
          onClick={signInWithGoogle}
          className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          Entrar com o Google
        </button>
      </div>
    </div>
  );
}
