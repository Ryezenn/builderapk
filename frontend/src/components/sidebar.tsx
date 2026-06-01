'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import {
  LayoutDashboard,
  Cpu,
  Terminal,
  KeyRound,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'APK Builder', href: '/dashboard/builder', icon: Smartphone },
    { name: 'My APIs', href: '/dashboard/apis', icon: Terminal },
    { name: 'API Key Manager', href: '/dashboard/keys', icon: KeyRound },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isAdmin = user?.email === 'admin@buildrx.com' || user?.plan === 'ENTERPRISE';

  return (
    <aside className="w-64 bg-[#070b16] border-r border-white/5 flex flex-col justify-between h-screen sticky top-0">
      {/* Sidebar Header Brand */}
      <div>
        <div className="p-6 border-b border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/10">
            B
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight">
              Buildr<span className="text-indigo-400">X</span>
            </span>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">SaaS Platform</div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-white/5 bg-white/1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-300">
            {user?.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{user?.name || 'Developer Session'}</div>
            <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-1 ${
              user?.plan === 'PRO' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
              user?.plan === 'ENTERPRISE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              'bg-white/5 text-gray-400'
            }`}>
              {user?.plan || 'FREE TIER'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = handleActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-300 font-black'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Admin Moderation Option */}
          {isAdmin && (
            <div className="pt-4 border-t border-white/5 mt-4">
              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider px-4 mb-2">Moderator View</div>
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  pathname.startsWith('/admin')
                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300 font-black'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Superadmin Panel
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Logout Trigger */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Session
        </button>
      </div>
    </aside>
  );
}
