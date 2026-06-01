'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Search, Globe, Shield, Terminal, ArrowRight, Star } from 'lucide-react';

interface ApiItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  isPaid: boolean;
  pricePerMonth: number | null;
  rateLimit: number;
  user: {
    name: string;
  };
}

export default function MarketplacePage() {
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'AI', 'Payments', 'Data', 'Social', 'Weather', 'Utilities'];

  const mockApis: ApiItem[] = [
    {
      id: 'mock-1',
      name: 'NeuralText AI Engine',
      slug: 'neuraltext-ai',
      description: 'Ultra high-speed LLM summarization and prompts processor proxy with structured JSON output templates.',
      category: 'AI',
      isPaid: true,
      pricePerMonth: 29.99,
      rateLimit: 120,
      user: { name: 'AlphaNode Team' }
    },
    {
      id: 'mock-2',
      name: 'CryptoRate Realtime Feed',
      slug: 'cryptorate-feed',
      description: 'Stream current ticker rates across 250+ tokens directly. Zero latency cache coverage.',
      category: 'Payments',
      isPaid: false,
      pricePerMonth: null,
      rateLimit: 60,
      user: { name: 'CoinNet' }
    },
    {
      id: 'mock-3',
      name: 'EcoWeather Core',
      slug: 'ecoweather-core',
      description: 'Precise hyper-localized weather forecasts, historical temperature logs, and precipitation metrics.',
      category: 'Weather',
      isPaid: true,
      pricePerMonth: 9.99,
      rateLimit: 90,
      user: { name: 'EcoMinds' }
    },
  ];

  const fetchApis = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/marketplace', {
        params: { search, category, limit: 20 },
      });
      const data = response.data.apis;
      if (data && data.length > 0) {
        setApis(data);
      } else {
        // Fallback to mock apis for premium initial visuals
        setApis(mockApis.filter(api => {
          const matchSearch = api.name.toLowerCase().includes(search.toLowerCase()) || 
                              api.description.toLowerCase().includes(search.toLowerCase());
          const matchCat = category === 'all' || api.category.toLowerCase() === category.toLowerCase();
          return matchSearch && matchCat;
        }));
      }
    } catch (error) {
      console.warn('Backend offline or error loading APIs. Displaying premium fallback marketplace.');
      setApis(mockApis);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApis();
    }, 300); // Debounced search
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden py-16 px-6 md:px-12">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-950/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Navigation back */}
        <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-white">
              B
            </div>
            <span className="font-extrabold text-white text-lg">Buildr<span className="text-indigo-400">X</span> Marketplace</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Go to dashboard &rarr;
          </Link>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 gradient-text">
            Discover Service APIs
          </h1>
          <p className="text-gray-400">
            Secure, rate-limited, and monetized developer-published endpoints. Subscribe to keys instantly and test them right inside your browser docs explorer.
          </p>
        </div>

        {/* Search and Category Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search public APIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input border border-white/5 text-sm"
            />
          </div>

          {/* Category Selector */}
          <div className="flex gap-2 flex-wrap items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* API Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl glass-card animate-pulse flex flex-col justify-between p-6">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-5/6" />
                </div>
                <div className="h-4 bg-white/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : apis.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/5 glass-panel">
            <p className="text-gray-400 mb-2">No APIs matching your query were found.</p>
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="text-indigo-400 text-sm font-semibold hover:underline">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apis.map((api) => (
              <div key={api.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between h-72 border border-white/5">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-indigo-300 uppercase tracking-wide">
                      {api.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" /> 4.9
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{api.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                    {api.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center mt-auto">
                  <div>
                    <span className="text-xs text-gray-500">Pricing Plan</span>
                    <div className="text-base font-extrabold text-white">
                      {api.isPaid ? `$${api.pricePerMonth}/mo` : 'Free Tier'}
                    </div>
                  </div>
                  <Link
                    href={`/marketplace/${api.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white text-xs font-bold text-gray-300 transition-all flex items-center gap-1.5 border border-white/10"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
