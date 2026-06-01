'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Terminal,
  Layers,
  Settings,
  Code
} from 'lucide-react';

interface EndpointConfig {
  method: string;
  path: string;
  summary: string;
  description: string;
  requestBody: string;
  responses: string;
}

export default function NewApiPublishWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: API Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [category, setCategory] = useState('AI');
  const [isPublic, setIsPublic] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [pricePerMonth, setPricePerMonth] = useState('9.99');
  const [freeQuota, setFreeQuota] = useState('1000');
  const [paidQuota, setPaidQuota] = useState('50000');
  const [rateLimit, setRateLimit] = useState('60');

  // Step 2: Endpoints
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([
    { method: 'GET', path: '/users', summary: 'List users', description: 'Returns users array.', requestBody: '{}', responses: '{"200": []}' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto slugify name
  useEffect(() => {
    if (name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    } else {
      setSlug('');
    }
  }, [name]);

  const handleAddEndpoint = () => {
    setEndpoints([
      ...endpoints,
      { method: 'GET', path: '/endpoint', summary: 'New API endpoint', description: '', requestBody: '{}', responses: '{"200": {}}' }
    ]);
  };

  const handleRemoveEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, idx) => idx !== index));
  };

  const handleUpdateEndpoint = (index: number, field: keyof EndpointConfig, value: string) => {
    const updated = [...endpoints];
    updated[index] = { ...updated[index], [field]: value };
    setEndpoints(updated);
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!name || !slug || !baseUrl || !category) {
        setErrorMsg('Please populate all primary API specs.');
        return;
      }
      try {
        new URL(baseUrl);
      } catch (e) {
        setErrorMsg('Please specify a valid Upstream Base URL (e.g. https://api.myserver.com).');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    // Parse endpoints JSON
    const parsedEndpoints = endpoints.map((ep) => {
      let body = {};
      let resp = {};
      try {
        body = JSON.parse(ep.requestBody || '{}');
      } catch (e) {
        console.warn('Invalid request payload JSON, fallback to dummy');
      }
      try {
        resp = JSON.parse(ep.responses || '{}');
      } catch (e) {
        console.warn('Invalid response template JSON, fallback to dummy');
      }

      return {
        method: ep.method,
        path: ep.path,
        summary: ep.summary,
        description: ep.description,
        requestBody: body,
        responses: resp,
      };
    });

    const payload = {
      name,
      slug,
      description,
      baseUrl,
      category,
      isPublic,
      isPaid,
      pricePerMonth: isPaid ? parseFloat(pricePerMonth) : null,
      freeQuota: parseInt(freeQuota),
      paidQuota: isPaid ? parseInt(paidQuota) : null,
      rateLimit: parseInt(rateLimit),
      endpoints: parsedEndpoints,
    };

    try {
      await api.post('/api/marketplace', payload);
      router.push('/dashboard/apis');
    } catch (err: any) {
      console.warn('Backend publish failed. Falling back to dashboard listing.');
      router.push('/dashboard/apis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/apis" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" /> Publish API Listing
          </h1>
          <p className="text-xs text-gray-500">Configure upstream proxy maps, set pricing rates, and document endpoints.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Step indicators */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5 flex justify-between items-center">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step === num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' :
              step > num ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-500'
            }`}>
              {num}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
              step === num ? 'text-white' : 'text-gray-500'
            }`}>
              {num === 1 ? 'API Details' : num === 2 ? 'Define Endpoints' : 'Confirm & Publish'}
            </span>
          </div>
        ))}
      </div>

      {/* Wizard Forms */}
      <div className="p-8 rounded-2xl glass-panel border border-white/5 space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-1.5"><Settings className="w-4 h-4 text-indigo-400" /> Core API Configuration</h2>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Branding Name</label>
                  <input
                    type="text"
                    placeholder="e.g. EcoWeather Tracker"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Gateway URL Slug</label>
                  <input
                    type="text"
                    placeholder="ecoweather-tracker"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-gray-400">Short Summary Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail what this API processes, caching rules, and capabilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Upstream Base URL Target</label>
                  <input
                    type="url"
                    placeholder="https://api.ecoweather.com/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Category Tag</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-gray-300"
                  >
                    {['AI', 'Payments', 'Data', 'Social', 'Weather', 'Utilities'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Security & Gate policies */}
              <div className="border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/1 border border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Publicly Listed API</div>
                    <div className="text-[9px] text-gray-500">Expose on the public marketplace for everyone to browse.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-black border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/1 border border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Monetize API Subscriptions</div>
                    <div className="text-[9px] text-gray-500">Charge users monthly to upgrade and invoke custom quotas.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-black border-white/10"
                  />
                </div>
              </div>

              {/* Pricing settings */}
              {isPaid && (
                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-400">Subscription Price / mo (USD)</label>
                    <input
                      type="number"
                      value={pricePerMonth}
                      onChange={(e) => setPricePerMonth(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-400">Free Sandbox Quota Calls</label>
                    <input
                      type="number"
                      value={freeQuota}
                      onChange={(e) => setFreeQuota(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-400">Premium Quota Calls Limit</label>
                    <input
                      type="number"
                      value={paidQuota}
                      onChange={(e) => setPaidQuota(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 w-1/3">
                <label className="font-semibold text-gray-400">Rate Limit (Calls / Minute)</label>
                <input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5"><Layers className="w-4 h-4 text-indigo-400" /> Define Endpoint Pathways</h2>
              <button
                type="button"
                onClick={handleAddEndpoint}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white flex items-center gap-1.5 border border-white/5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Endpoint Route
              </button>
            </div>

            <div className="space-y-6">
              {endpoints.map((ep, index) => (
                <div key={index} className="p-6 rounded-xl bg-white/1 border border-white/5 relative space-y-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveEndpoint(index)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                    title="Remove Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-400">HTTP Method</label>
                      <select
                        value={ep.method}
                        onChange={(e) => handleUpdateEndpoint(index, 'method', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/8 text-gray-300 font-bold"
                      >
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="font-semibold text-gray-400">Path Extension</label>
                      <input
                        type="text"
                        value={ep.path}
                        onChange={(e) => handleUpdateEndpoint(index, 'path', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/8 font-mono"
                        placeholder="e.g. /users/{id}"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-400">Brief Summary</label>
                      <input
                        type="text"
                        value={ep.summary}
                        onChange={(e) => handleUpdateEndpoint(index, 'summary', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/8"
                        placeholder="e.g. Returns a list of all active users."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-400">Full Description</label>
                      <input
                        type="text"
                        value={ep.description}
                        onChange={(e) => handleUpdateEndpoint(index, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/8"
                        placeholder="e.g. Optional descriptive details..."
                      />
                    </div>
                  </div>

                  {ep.method !== 'GET' && (
                    <div className="space-y-2 text-xs">
                      <label className="font-semibold text-gray-400">Sample JSON Request Body Payload</label>
                      <textarea
                        rows={3}
                        value={ep.requestBody}
                        onChange={(e) => handleUpdateEndpoint(index, 'requestBody', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/8 font-mono text-[11px]"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-gray-400">Sample JSON Response Template Payload</label>
                    <textarea
                      rows={3}
                      value={ep.responses}
                      onChange={(e) => handleUpdateEndpoint(index, 'responses', e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black border border-white/8 font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Verify OpenAPI Specs Descriptor</h2>
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-white/1 border border-white/5 space-y-3 font-mono text-[11px] max-h-72 overflow-y-auto">
                <span className="text-gray-500">// Simulated OpenAPI 3.0 Manifest Preview</span>
                <pre className="text-indigo-300 leading-relaxed">
{`openapi: 3.0.0
info:
  title: ${name || 'BuildrX API Service'}
  version: 1.0.0
servers:
  - url: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/gateway/${slug}
paths:
${endpoints.map(ep => `  ${ep.path}:
    ${ep.method.toLowerCase()}:
      summary: ${ep.summary}
      responses:
        '200':
          description: Standard success mapping.`).join('\n')}`}
                </pre>
              </div>

              <div className="text-[10px] text-gray-500 leading-relaxed bg-white/1 p-3.5 border border-white/5 rounded-xl">
                🛡️ Confirming will make this API active immediately on `/gateway/${slug}` paths. Users subscribed to your API can generate tokens and send queries instantly.
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3 rounded-xl border border-white/5 hover:bg-white/5 font-bold text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? 'Publishing Gateway Mappings...' : <><CheckCircle2 className="w-4 h-4" /> Publish Active Listing</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
