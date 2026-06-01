'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please specify both email and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-center items-center px-6">
      {/* Glow flairs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/5 space-y-6 text-left relative">
        {/* Header brand logo */}
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            B
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
          <p className="text-xs text-gray-500">Access your BuildrX dashboard and compile templates.</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-semibold flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-500" /> Account Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl glass-input font-mono text-[11px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-gray-400 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-gray-500" /> Access Password</label>
              <Link href="/forgot-password" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/10 mt-6"
          >
            {submitting ? 'Authenticating session...' : <><ShieldCheck className="w-4.5 h-4.5" /> Sign In Dashboard</>}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5 text-[11px] text-gray-500">
          New developer here?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
            Register free profile
          </Link>
        </div>
      </div>
    </div>
  );
}
