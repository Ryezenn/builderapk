'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { User, Mail, Lock, PlusCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please populate name, email, and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await register(name, email, password);
      setSuccessMsg('Account registered successfully! Redirecting to login session.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try again.');
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
          <h2 className="text-2xl font-extrabold text-white">Create account</h2>
          <p className="text-xs text-gray-500">Register display profile and boot SaaS dashboards.</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-semibold flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs font-semibold flex gap-2">
            <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-gray-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-500" /> Full Display Name</label>
            <input
              type="text"
              placeholder="Elon Musk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl glass-input"
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-500" /> Professional Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl glass-input font-mono text-[11px]"
            />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-gray-400 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-gray-500" /> Security Access Password</label>
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
            {submitting ? 'Registering credentials...' : <><PlusCircle className="w-4.5 h-4.5" /> Boot Free Profile</>}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5 text-[11px] text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">
            Sign In Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple Helper Icon
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
