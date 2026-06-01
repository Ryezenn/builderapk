'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { ArrowLeft, Terminal, Send, Copy, CheckCircle2, Cpu, Globe, BookOpen } from 'lucide-react';

interface EndpointItem {
  id: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
  parameters?: any;
  requestBody?: any;
  responses?: any;
  example?: any;
}

interface ApiDetails {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  category: string;
  endpoints: EndpointItem[];
}

export default function InteractiveDocsPage() {
  const { slug } = useParams() as { slug: string };

  const [apiData, setApiData] = useState<ApiDetails | null>(null);
  const [selectedEp, setSelectedEp] = useState<EndpointItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try-It States
  const [apiKey, setApiKey] = useState('');
  const [paramInputs, setParamInputs] = useState<{ [key: string]: string }>({});
  const [bodyInput, setBodyInput] = useState('{}');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState('');
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const mockApiData: ApiDetails = {
    id: 'mock-1',
    name: 'NeuralText AI Engine',
    slug: 'neuraltext-ai',
    baseUrl: 'https://api.openai-mock.com/v1',
    category: 'AI',
    endpoints: [
      {
        id: 'ep-1',
        method: 'POST',
        path: '/summarize',
        summary: 'Generate abstract summaries.',
        description: 'Processes long paragraphs of text into a high quality summary bullet points set.',
        parameters: [
          { name: 'length', type: 'string', required: false, description: 'Return length format: "short" or "long"' },
        ],
        requestBody: {
          text: 'Paste long paragraph of articles here to compress context size...'
        },
        responses: {
          200: { summary: 'This is a high quality compressed abstract summary return.' }
        },
        example: { text: 'BuildrX makes native compilations easy.' }
      },
      {
        id: 'ep-2',
        method: 'POST',
        path: '/analyze-sentiment',
        summary: 'Analyze text sentiment.',
        description: 'Analyzes user text and returns positive, neutral, or negative values.',
        parameters: [],
        requestBody: { text: 'I love BuildrX WebView builders!' },
        responses: {
          200: { sentiment: 'positive', score: 0.98 }
        }
      },
      {
        id: 'ep-3',
        method: 'GET',
        path: '/languages',
        summary: 'List supported formats.',
        description: 'Returns list of translations dictionaries formats codes supported by our system.',
        parameters: [
          { name: 'limit', type: 'integer', required: false, description: 'Limit items return count' }
        ],
        responses: {
          200: { languages: ['en', 'id', 'es', 'fr', 'de'] }
        }
      }
    ],
  };

  const fetchApiDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/marketplace/${slug}`);
      setApiData(response.data);
      if (response.data.endpoints && response.data.endpoints.length > 0) {
        setSelectedEp(response.data.endpoints[0]);
        // Set initial body input if present
        if (response.data.endpoints[0].requestBody) {
          setBodyInput(JSON.stringify(response.data.endpoints[0].requestBody, null, 2));
        }
      }
    } catch (error) {
      console.warn('Backend details not found. Rendering fallback mock interactive documentation.');
      setApiData(mockApiData);
      setSelectedEp(mockApiData.endpoints[0]);
      setBodyInput(JSON.stringify(mockApiData.endpoints[0].requestBody || {}, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiDetails();
    // Try to auto-load keys from localStorage
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      api.get('/api/keys')
        .then((res) => {
          // Find if there is a key generated for this API
          if (res.data && res.data.length > 0) {
            const match = res.data.find((k: any) => k.api.slug === slug);
            if (match) setApiKey(match.key);
          }
        })
        .catch(() => {});
    }
  }, [slug]);

  // Adjust parameters when endpoint changes
  useEffect(() => {
    if (selectedEp) {
      const initial: { [key: string]: string } = {};
      const paramsList = selectedEp.parameters || [];
      if (Array.isArray(paramsList)) {
        paramsList.forEach((p: any) => {
          initial[p.name] = '';
        });
      }
      setParamInputs(initial);
      setBodyInput(JSON.stringify(selectedEp.requestBody || selectedEp.example || {}, null, 2));
      setResponseBody('');
      setResponseStatus(null);
      setResponseLatency(null);
    }
  }, [selectedEp]);

  const handleTryIt = async () => {
    if (!selectedEp || !apiData) return;

    setIsSending(true);
    setResponseBody('');
    setResponseStatus(null);
    setResponseLatency(null);

    const startTime = Date.now();
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    // Build URL query string
    const queryParams = new URLSearchParams();
    Object.keys(paramInputs).forEach((key) => {
      if (paramInputs[key]) {
        queryParams.append(key, paramInputs[key]);
      }
    });

    const queryString = queryParams.toString();
    const pathSuffix = selectedEp.path + (queryString ? `?${queryString}` : '');
    const gatewayUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/gateway/${apiData.slug}${pathSuffix}`;

    try {
      const res = await axios({
        method: selectedEp.method as any,
        url: gatewayUrl,
        headers,
        data: ['POST', 'PUT', 'PATCH'].includes(selectedEp.method) ? JSON.parse(bodyInput) : undefined,
        timeout: 10000,
      });

      setResponseLatency(Date.now() - startTime);
      setResponseStatus(res.status);
      setResponseBody(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setResponseLatency(Date.now() - startTime);
      setResponseStatus(err.response?.status || 502);
      setResponseBody(JSON.stringify(err.response?.data || { error: 'Upstream gateway timeout or invalid API key' }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!apiData || !selectedEp) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Documentation Not Found</h2>
        <Link href="/marketplace" className="text-indigo-400 hover:underline">
          Return to marketplace
        </Link>
      </div>
    );
  }

  // Prebuild dynamic code snippets based on selections
  const gatewayHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const fullEndpointUrl = `${gatewayHost}/gateway/${apiData.slug}${selectedEp.path}`;
  
  const snippets = {
    curl: `curl -X ${selectedEp.method} "${fullEndpointUrl}" \\\n  -H "x-api-key: ${apiKey || 'bx_live_your_api_key_here'}" \\\n  -H "Content-Type: application/json"${selectedEp.method !== 'GET' ? ` \\\n  -d '${bodyInput.replace(/\n/g, '')}'` : ''}`,
    js: `fetch("${fullEndpointUrl}", {\n  method: "${selectedEp.method}",\n  headers: {\n    "x-api-key": "${apiKey || 'bx_live_your_api_key_here'}",\n    "Content-Type": "application/json"\n  }${selectedEp.method !== 'GET' ? `,\n  body: JSON.stringify(${bodyInput.replace(/\n/g, '')})` : ''}\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
    python: `import requests\n\nurl = "${fullEndpointUrl}"\nheaders = {\n    "x-api-key": "${apiKey || 'bx_live_your_api_key_here'}",\n    "Content-Type": "application/json"\n}\n${selectedEp.method !== 'GET' ? `data = ${bodyInput.replace(/\n/g, '')}\nres = requests.post(url, headers=headers, json=data)` : 'res = requests.get(url, headers=headers)'}\n\nprint(res.json())`
  };

  return (
    <div className="min-h-screen bg-[#030712] text-[#f9fafb] flex flex-col">
      {/* Top Navbar */}
      <header className="glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link href={`/marketplace/${apiData.slug}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-extrabold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> {apiData.name} <span className="text-xs text-gray-500 font-mono">v1.0 Docs</span>
          </span>
        </div>
        <Link href="/dashboard" className="text-xs font-semibold text-gray-400 hover:text-white">
          Back to Dashboard
        </Link>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar List */}
        <aside className="w-full md:w-64 bg-gray-950/20 border-r border-white/5 p-6 space-y-4 overflow-y-auto">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Endpoints List</div>
          <nav className="space-y-1">
            {apiData.endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEp(ep)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedEp.id === ep.id
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-300'
                    : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/2'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black font-mono ${
                  ep.method === 'GET' ? 'bg-emerald-500/15 text-emerald-400' :
                  ep.method === 'POST' ? 'bg-indigo-500/15 text-indigo-400' :
                  'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {ep.method}
                </span>
                <span className="truncate">{ep.path}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Center Endpoint Documentation */}
        <main className="flex-1 p-8 overflow-y-auto border-r border-white/5 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono tracking-wide ${
                selectedEp.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                selectedEp.method === 'POST' ? 'bg-indigo-500/10 text-indigo-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {selectedEp.method}
              </span>
              <h2 className="text-xl font-bold font-mono text-white">{selectedEp.path}</h2>
            </div>
            <p className="text-gray-400 text-xs mt-2">{selectedEp.summary}</p>
            {selectedEp.description && (
              <p className="text-xs text-gray-500 mt-2 bg-white/1 p-3 rounded-lg leading-relaxed">{selectedEp.description}</p>
            )}
          </div>

          {/* Parameters Map */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Query Parameters</h3>
            {selectedEp.parameters && selectedEp.parameters.length > 0 ? (
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5 font-semibold text-gray-400">
                      <th className="p-3">Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {selectedEp.parameters.map((p: any) => (
                      <tr key={p.name}>
                        <td className="p-3 font-mono font-bold text-white">{p.name}</td>
                        <td className="p-3 font-mono text-indigo-300">{p.type}</td>
                        <td className="p-3 font-mono">{p.required ? 'true' : 'false'}</td>
                        <td className="p-3 text-gray-400">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic p-3 bg-white/1 rounded-lg">No query parameters defined.</div>
            )}
          </div>

          {/* Code Snippets Section */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Code Integration Snippets</h3>
            <div className="rounded-xl border border-white/5 overflow-hidden bg-gray-950/40 p-4">
              <div className="flex gap-4 border-b border-white/5 pb-3 mb-4">
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> Client Code Templates</div>
              </div>
              
              <div className="space-y-4">
                {Object.keys(snippets).map((key) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
                      <span>{key}</span>
                      <button
                        onClick={() => handleCopySnippet((snippets as any)[key], key)}
                        className="hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                      >
                        {copiedIndex === key ? 'Copied!' : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-lg bg-black text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                      {(snippets as any)[key]}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Try-It Panel */}
        <aside className="w-full md:w-[450px] p-8 bg-gray-950/20 overflow-y-auto space-y-6 border-l border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Try It Sandbox</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* API Key Form */}
            <div className="space-y-2">
              <label className="font-semibold text-gray-400">Gateway Client API Key (x-api-key)</label>
              <input
                type="text"
                placeholder="bx_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 rounded-xl bg-black border border-white/8 text-xs font-mono"
              />
              <p className="text-[10px] text-gray-500">Auto-injects from active marketplace subscriptions.</p>
            </div>

            {/* Dynamic Parameter Fields */}
            {selectedEp.parameters && selectedEp.parameters.length > 0 && (
              <div className="space-y-3">
                <label className="font-semibold text-gray-400">Path Parameters</label>
                {selectedEp.parameters.map((p: any) => (
                  <div key={p.name} className="flex gap-2 items-center">
                    <span className="w-24 font-mono text-[10px] truncate text-gray-500">{p.name}</span>
                    <input
                      type="text"
                      placeholder={`value (${p.type})`}
                      value={paramInputs[p.name] || ''}
                      onChange={(e) => setParamInputs({ ...paramInputs, [p.name]: e.target.value })}
                      className="flex-1 p-2.5 rounded-lg bg-black border border-white/8 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Body TextArea for POST/PUT */}
            {['POST', 'PUT', 'PATCH'].includes(selectedEp.method) && (
              <div className="space-y-2">
                <label className="font-semibold text-gray-400">Request Body Payload (JSON)</label>
                <textarea
                  rows={6}
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black border border-white/8 text-xs font-mono leading-relaxed"
                />
              </div>
            )}

            {/* Send Trigger */}
            <button
              onClick={handleTryIt}
              disabled={isSending}
              className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {isSending ? 'Sending Request...' : <><Send className="w-3.5 h-3.5" /> Send Test Call</>}
            </button>

            {/* Live Gateway Response */}
            {(responseStatus !== null || responseBody) && (
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-400">Sandbox Output Log</span>
                  <div className="flex gap-3 text-[10px] font-mono">
                    {responseStatus && (
                      <span className={`px-2 py-0.5 rounded font-black ${
                        responseStatus >= 200 && responseStatus < 300 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        STATUS: {responseStatus}
                      </span>
                    )}
                    {responseLatency !== null && (
                      <span className="text-gray-500">LATENCY: {responseLatency}ms</span>
                    )}
                  </div>
                </div>

                <pre className="p-3.5 rounded-xl bg-black border border-white/5 text-gray-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                  {responseBody || 'Executing call...'}
                </pre>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
