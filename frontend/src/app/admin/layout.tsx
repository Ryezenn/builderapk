'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAdmin = user?.email === 'admin@buildrx.com' || user?.plan === 'ENTERPRISE';

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      console.warn('[AdminGuard] Access denied. Redirecting user.');
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black mb-2">403 - Access Forbidden</h1>
        <p className="text-sm text-gray-500 max-w-md mb-8">
          You lack the elevated administrative privileges required to access the global moderator panel interfaces.
        </p>
        <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-xs flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex bg-[#030712] text-[#f9fafb] min-h-screen">
      {/* Sidebar for admin */}
      <aside className="w-64 bg-[#050810] border-r border-white/5 flex flex-col justify-between h-screen sticky top-0">
        <div>
          <div className="p-6 border-b border-white/5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white">A</div>
            <div>
              <span className="font-extrabold text-white text-sm">BuildrX Admin</span>
              <div className="text-[8px] text-emerald-400 font-bold tracking-wider mt-0.5">SUPERADMIN GUARDED</div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/2 transition-all">
              &larr; Back to Dashboard
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black bg-emerald-600/10 border border-emerald-500/25 text-emerald-300">
              🛡️ Moderation Desk
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main viewport */}
      <main className="flex-1 p-8 md:p-12 overflow-x-hidden relative">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-emerald-950/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
