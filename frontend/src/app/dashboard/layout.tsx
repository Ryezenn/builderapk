'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[DashboardGuard] Unauthenticated user, redirecting to login.');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <div className="text-xs text-gray-500 font-mono tracking-wider uppercase">Loading active session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevent showing flash of dashboard
  }

  return (
    <div className="flex bg-[#030712] text-[#f9fafb] min-h-screen">
      {/* Global Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-x-hidden relative p-8 md:p-12">
        {/* Background gradient flare */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
