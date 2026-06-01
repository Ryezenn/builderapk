'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/auth-context';
import { ArrowLeft, BookOpen, Terminal, CheckCircle2, Shield, Layers, Zap } from 'lucide-react';

interface EndpointItem {
  id: string;
  method: string;
  path: string;
  summary: string;
}

interface ApiDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  category: string;
  isPaid: boolean;
  pricePerMonth: number | null;
  freeQuota: number;
  paidQuota: number | null;
  rateLimit: number;
  endpoints: EndpointItem[];
}

export default function ApiDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [apiData, setApiData] = useState<ApiDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mockApiData: ApiDetails = {
    id: 'mock-1',
    name: 'NeuralText AI Engine',
    slug: 'neuraltext-ai',
    description: 'Ultra high-speed LLM summarization and prompts processor proxy with structured JSON output templates. Perfect for scaling conversational workflows, analyzing comments, and summarizing long-form texts in high throughput setups.',
    baseUrl: 'https://api.openai-mock.com/v1',
    category: 'AI',
    isPaid: true,
    pricePerMonth: 29.99,
    freeQuota: 1000,
    paidQuota: 50000,
    rateLimit: 120,
    endpoints: [
      { id: 'ep-1', method: 'POST', path: '/summarize', summary: 'Generate professional abstract summaries from long text blocks.' },
      { id: 'ep-2', method: 'POST', path: '/analyze-sentiment', summary: 'Analyze positive, negative, and neutral values in user messages.' },
      { id: 'ep-3', method: 'GET', path: '/languages', summary: 'List all supported translations formats.' },
    ],
  };

  const fetchApiDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/marketplace/${slug}`);
      setApiData(response.data);
    } catch (error) {
      console.warn('Backend details not found. Displaying fallback mockup API configurations.');
      // Fallback matching mockup names or custom slugs
      setApiData(mockApiData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiDetails();
  }, [slug]);

  const handleSubscribe = async (planType: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!apiData) return;

    setSubscribing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post(`/api/marketplace/${apiData.id}/subscribe`, { plan: planType });
      setSuccessMsg(`Subscribed to the ${planType.toUpperCase()} plan successfully! Key generated.`);
      setTimeout(() => {
        router.push('/dashboard/keys');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Subscription processing failed. Verify billing profiles.');
    } finally {
      setSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">API Not Found</h2>
        <Link href="/marketplace" className="text-indigo-400 hover:underline">
          Return to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden py-16 px-6 md:px-12">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto z-10 relative">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* API Info Header */}
        <div className="p-8 rounded-2xl glass-panel border border-white/5 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase tracking-wide">
                {apiData.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3">{apiData.name}</h1>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Link
                href={`/docs/${apiData.slug}`}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm text-center flex items-center justify-center gap-2 border border-white/10"
              >
                <BookOpen className="w-4 h-4" /> Interactive Docs
              </Link>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
            {apiData.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-6">
            <div className="p-4 rounded-xl bg-white/2">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Upstream Base URL</div>
              <div className="text-xs text-white truncate font-mono">{apiData.baseUrl}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/2">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Rate Limit</div>
              <div className="text-xs text-white font-mono">{apiData.rateLimit} req/min</div>
            </div>
            <div className="p-4 rounded-xl bg-white/2">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Free Allowance</div>
              <div className="text-xs text-white font-mono">{apiData.freeQuota.toLocaleString()} calls/mo</div>
            </div>
            <div className="p-4 rounded-xl bg-white/2">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Proxy Path</div>
              <div className="text-xs text-indigo-400 font-bold font-mono">/gateway/{apiData.slug}</div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Section */}
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" /> Choose Access Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl glass-card flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Free Sandbox</h3>
              <p className="text-xs text-gray-400 mb-6">Quick tests and prototyping integrations.</p>
              <div className="text-3xl font-extrabold text-white mb-6">$0 <span className="text-xs font-normal text-gray-500">/ forever</span></div>
              <ul className="space-y-4 mb-8 text-xs text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {apiData.freeQuota.toLocaleString()} calls per month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard {apiData.rateLimit} req/min rate limit</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic response latencies</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe('free')}
              disabled={subscribing}
              className="w-full py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors text-sm"
            >
              {subscribing ? 'Processing...' : 'Subscribe Free'}
            </button>
          </div>

          {/* Paid Plan */}
          {apiData.isPaid ? (
            <div className="p-8 rounded-2xl glass-card border-indigo-500/30 flex flex-col justify-between text-left shadow-lg shadow-indigo-950/20">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Unlimited Pro</h3>
                <p className="text-xs text-gray-400 mb-6">High volumes for production scale software.</p>
                <div className="text-3xl font-extrabold text-white mb-6">${apiData.pricePerMonth} <span className="text-xs font-normal text-gray-500">/ month</span></div>
                <ul className="space-y-4 mb-8 text-xs text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> {(apiData.paidQuota || 50000).toLocaleString()} calls per month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Standard {apiData.rateLimit} req/min rate limit</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> High-speed priority gateway channels</li>
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={subscribing}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transition-all shadow-md shadow-indigo-600/10 text-sm"
              >
                {subscribing ? 'Processing...' : 'Subscribe Plan'}
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-card flex items-center justify-center text-center">
              <div>
                <Layers className="w-8 h-8 text-gray-600 mx-auto mb-4" />
                <h4 className="font-bold text-white mb-1">No Premium Tiers</h4>
                <p className="text-xs text-gray-400">This API is offered completely free by its publisher.</p>
              </div>
            </div>
          )}
        </div>

        {/* Endpoints List */}
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" /> Available Endpoints Mappings
        </h2>

        <div className="space-y-4">
          {apiData.endpoints.map((ep) => (
            <div key={ep.id} className="p-5 rounded-xl glass-panel border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono tracking-wide ${
                  ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                  ep.method === 'POST' ? 'bg-indigo-500/10 text-indigo-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {ep.method}
                </span>
                <div>
                  <div className="font-bold text-white font-mono text-sm">{ep.path}</div>
                  <div className="text-xs text-gray-400 mt-1">{ep.summary}</div>
                </div>
              </div>
              <Link
                href={`/docs/${apiData.slug}`}
                className="text-xs font-semibold text-indigo-400 hover:underline hover:text-indigo-300"
              >
                Test in docs &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
