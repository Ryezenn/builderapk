'use client';

import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { ArrowLeft, CheckCircle2, Zap } from 'lucide-react';

export default function PricingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    { name: 'Monthly APK builds', free: '3 builds', pro: 'Unlimited', enterprise: 'Custom' },
    { name: 'Custom App Branding', free: '❌', pro: '✅ (Icon, colors)', enterprise: '✅ (Splashes, configs)' },
    { name: 'JavaScript Native Bridges', free: '❌', pro: '✅', enterprise: '✅' },
    { name: 'Host Public APIs', free: '1 API', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Host Private APIs', free: '❌', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Monthly API Gateway Calls', free: '1,000 / month', pro: '100,000 / month', enterprise: 'Unlimited' },
    { name: 'Gateway Rate Limits', free: '60 req/min', pro: '1,000 req/min', enterprise: 'Unlimited' },
    { name: 'Analytical dashboard graphs', free: 'Basic logs', pro: 'Full graphs (30 days)', enterprise: 'Full graphs (Custom)' },
    { name: 'Docker On-Premise compilers', free: '❌', pro: '❌', enterprise: '✅' },
    { name: 'Standard SLA uptime guarantee', free: '❌', pro: '99.9%', enterprise: '99.99%' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden py-16 px-6 md:px-12">
      {/* Background Gradient */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 gradient-text">
            Simple, developer-first pricing
          </h1>
          <p className="text-lg text-gray-400">
            BuildrX grows with you. Begin testing our system completely free, and scale your configurations as your traffic requirements grow.
          </p>
        </div>

        {/* Dynamic Matrix Comparison */}
        <div className="rounded-2xl border border-white/5 glass-panel overflow-hidden mb-16">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="p-6 text-sm font-bold text-gray-400">Feature Mappings</th>
                  <th className="p-6 text-sm font-bold text-white text-center">Free Core</th>
                  <th className="p-6 text-sm font-bold text-indigo-400 text-center">Developer Pro</th>
                  <th className="p-6 text-sm font-bold text-emerald-400 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {features.map((f, idx) => (
                  <tr key={idx} className="hover:bg-white/1">
                    <td className="p-6 font-semibold text-white">{f.name}</td>
                    <td className="p-6 text-center text-gray-400 font-mono">{f.free}</td>
                    <td className="p-6 text-center text-indigo-300 font-bold font-mono">{f.pro}</td>
                    <td className="p-6 text-center text-emerald-300 font-bold font-mono">{f.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-900/40 via-indigo-950/20 to-transparent border border-indigo-500/20 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-indigo-400" /> Start creating and publishing today
            </h3>
            <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
              Create an account instantly and get unlimited dashboard access. Transform your web assets into signed native packages or monetize backend services.
            </p>
          </div>
          <Link
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="px-8 py-4 rounded-xl font-bold bg-white text-black hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-white/5"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Register Now'} <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
