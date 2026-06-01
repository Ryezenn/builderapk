'use client';

import Link from 'next/link';
import { useAuth } from '../context/auth-context';
import { Terminal, Shield, Cpu, Zap, Globe, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-950/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            B
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Buildr<span className="text-indigo-400">X</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
          <Link href="/marketplace" className="hover:text-white transition-colors">API Marketplace</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-20 pb-16 text-center max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-white/5 text-xs font-semibold text-indigo-300 mb-6 animate-bounce">
          <Zap className="w-3.5 h-3.5" /> Transform Web Apps and APIs Instantly
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="gradient-text">Convert Websites to APKs.</span><br />
          <span className="accent-text">Monetize Your Service APIs.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          BuildrX is the ultimate production-grade SaaS for developers and businesses. Instantly generate signed WebView-based Android APKs from URLs and publish, sell, and rate-limit access to your APIs on our global marketplace.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            Start Building Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/marketplace"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold glass-card border border-white/5 text-white hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
          >
            Explore API Marketplace
          </Link>
        </div>

        {/* Hero Mockup */}
        <div className="mt-16 rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-2.5 md:p-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <div className="rounded-xl overflow-hidden glass-panel border border-white/5 aspect-[16/9] flex items-center justify-center bg-gray-950/40 relative">
            {/* Display simulated Dashboard visual */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-gray-500 font-mono">dashboard.buildrx.com</div>
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6 my-auto">
                <div className="p-5 rounded-2xl glass-card">
                  <div className="text-gray-400 text-xs font-semibold mb-2">Generated APKs</div>
                  <div className="text-3xl font-extrabold text-white">418</div>
                  <div className="text-emerald-400 text-[10px] font-semibold mt-1">▲ 12% this week</div>
                </div>
                <div className="p-5 rounded-2xl glass-card">
                  <div className="text-gray-400 text-xs font-semibold mb-2">API Gateway Volume</div>
                  <div className="text-3xl font-extrabold text-white">2.4M</div>
                  <div className="text-indigo-400 text-[10px] font-semibold mt-1">99.98% Gateway Uptime</div>
                </div>
                <div className="p-5 rounded-2xl glass-card">
                  <div className="text-gray-400 text-xs font-semibold mb-2">Global SaaS Revenue</div>
                  <div className="text-3xl font-extrabold text-white">$14,890</div>
                  <div className="text-emerald-400 text-[10px] font-semibold mt-1">▲ 24% monthly increase</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 font-mono text-center">BuildrX System Core - Online & Secured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-white/5 bg-gray-950/20 py-8 px-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-around items-center gap-6 text-sm font-semibold text-gray-500 uppercase tracking-widest">
          <span>⚡ High-Speed Gateway</span>
          <span>🛡️ SSL & Keystore Signed</span>
          <span>💳 Midtrans / Stripe Integrated</span>
          <span>📦 Docker Ready Deployments</span>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Everything you need in a modern SaaS</h2>
          <p className="text-gray-400">Transform URLs to functional Android WebView-based binaries and publish, rate limit, cache, and monetize your backend services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl glass-card relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">URL-to-APK Builder</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Inject website URLs, icons, colors, permission policies, file attachment capability, and bridges, and download clean signed APK release packages dynamically.
              </p>
            </div>
            <Link href="/register" className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 flex items-center gap-2">
              Generate APK Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-2xl glass-card relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">API Marketplace</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Publish endpoint paths, write summaries, define variables, parameters and responses, set pricing tiers, and sell subscription packages with automatically generated docs.
              </p>
            </div>
            <Link href="/marketplace" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 flex items-center gap-2">
              Publish Service API <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-2xl glass-card relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Enterprise API Gateway</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Connect upstreams to /gateway, authenticate client keys instantly using Redis caches, enforce sliding window rate-limits, and monitor latency and request logs.
              </p>
            </div>
            <Link href="/register" className="text-purple-400 text-sm font-semibold hover:text-purple-300 flex items-center gap-2">
              View Key Manager <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto text-center border-t border-white/5 relative z-10">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Simple, scale-friendly pricing</h2>
          <p className="text-gray-400">Unlock complete access with any of our modular subscriptions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="p-8 rounded-2xl glass-card border border-white/5 flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Free Core</h3>
              <p className="text-sm text-gray-400 mb-6">Explore the builder and marketplace portals.</p>
              <div className="text-4xl font-extrabold text-white mb-8">$0 <span className="text-sm font-normal text-gray-500">/ forever</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> 3 APK builds / month</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Host 1 public API</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> 1,000 free calls / key</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Standard API Gateway</li>
              </ul>
            </div>
            <Link href="/register" className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-center text-sm transition-colors">
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-2xl glass-card border-indigo-500/40 relative flex flex-col justify-between text-left shadow-xl shadow-indigo-950/20">
            <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500 text-[10px] font-bold text-white uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Developer Pro</h3>
              <p className="text-sm text-gray-400 mb-6">For active indie hackers and small dev teams.</p>
              <div className="text-4xl font-extrabold text-white mb-8">$49 <span className="text-sm font-normal text-gray-500">/ month</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Unlimited APK builds</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Host unlimited APIs (Public/Private)</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Custom package branding & bridges</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Advanced analytics graphs</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> 100,000 monthly API calls</li>
              </ul>
            </div>
            <Link href="/register" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-center text-sm transition-all shadow-md shadow-indigo-600/20">
              Go Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-2xl glass-card border border-white/5 flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-sm text-gray-400 mb-6">Custom parameters and high throughputs.</p>
              <div className="text-4xl font-extrabold text-white mb-8">Custom <span className="text-sm font-normal text-gray-500">/ annual</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Dedicate Docker APK compilers</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> Private on-prem S3 integrations</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> SLA backed rate-limiting</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" /> 24/7 dedicated system architects</li>
              </ul>
            </div>
            <Link href="mailto:enterprise@buildrx.com" className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-center text-sm transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 text-center text-gray-500 text-xs max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          &copy; {new Date().getFullYear()} BuildrX. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link href="/marketplace" className="hover:text-gray-300">Marketplace</Link>
          <Link href="/pricing" className="hover:text-gray-300">Pricing</Link>
          <Link href="mailto:support@buildrx.com" className="hover:text-gray-300">Support</Link>
        </div>
      </footer>
    </div>
  );
}
