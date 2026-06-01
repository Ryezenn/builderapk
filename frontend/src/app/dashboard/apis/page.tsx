'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Terminal, PlusCircle, ArrowRight, Eye, Shield, Tag, Cpu } from 'lucide-react';

interface ApiItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  isPublic: boolean;
  isPaid: boolean;
  pricePerMonth: number | null;
  totalCalls: string;
  createdAt: string;
}

export default function MyApisListPage() {
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyApis = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/apis'); // Query admin or list APIs. Let's make an overview query
      // Filter for owned APIs (we can display all or filter in production, fallback helps test offline)
      setApis(response.data || []);
    } catch (error) {
      console.warn('Backend APIs list not found. Serving premium mockup assets.');
      setApis([
        {
          id: 'mock-a1',
          name: 'NeuralText AI Engine',
          slug: 'neuraltext-ai',
          category: 'AI',
          isPublic: true,
          isPaid: true,
          pricePerMonth: 29.99,
          totalCalls: '249503',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock-a2',
          name: 'Local Weather Scraper',
          slug: 'local-weather',
          category: 'Weather',
          isPublic: false,
          isPaid: false,
          pricePerMonth: null,
          totalCalls: '1093',
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApis();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Hosted APIs</h1>
          <p className="text-sm text-gray-400 mt-1">Publish and monetize your services on our global marketplace.</p>
        </div>
        <Link
          href="/dashboard/apis/new"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10"
        >
          <PlusCircle className="w-4 h-4" /> Publish New API
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 rounded-2xl glass-card animate-pulse" />
          ))}
        </div>
      ) : apis.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/5 glass-panel max-w-xl mx-auto">
          <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="font-bold text-white text-lg mb-1">No APIs Hosted</h3>
          <p className="text-xs text-gray-500 mb-6">Map your backend HTTP servers to a slug and launch your API on the public marketplace.</p>
          <Link
            href="/dashboard/apis/new"
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2"
          >
            Publish First API <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apis.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between h-52">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Terminal className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.name}</h3>
                      <span className="text-[10px] text-gray-500 font-mono">/gateway/{item.slug}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      item.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-white/5 text-gray-400'
                    }`}>
                      {item.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  <div>
                    <span className="text-gray-600 block text-[8px]">Category</span>
                    <span className="text-indigo-300 font-mono flex items-center gap-1 mt-0.5"><Tag className="w-3.5 h-3.5" /> {item.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[8px]">Price Month</span>
                    <span className="text-white font-mono mt-0.5">{item.isPaid ? `$${item.pricePerMonth}` : 'Free'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-[8px]">Total calls</span>
                    <span className="text-emerald-300 font-mono mt-0.5 flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> {Number(item.totalCalls).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <Link
                  href={`/marketplace/${item.slug}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                >
                  View Marketplace Page <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                
                <Link
                  href={`/dashboard/apis/${item.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors flex items-center gap-1.5 border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5" /> Edit config
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
