'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { ArrowLeft, Smartphone, CheckCircle2, AlertTriangle, Download, Terminal, Loader2 } from 'lucide-react';

interface BuildDetails {
  id: string;
  appName: string;
  packageName: string;
  websiteUrl: string;
  status: string;
  apkUrl: string | null;
  errorLog: string | null;
  createdAt: string;
}

export default function BuildDetailsProgressPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [build, setBuild] = useState<BuildDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // SSE progress states
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Enqueuing task...');
  const [sseLogs, setSseLogs] = useState<string[]>(['[System] Build task added to local memory queue.']);

  const fetchBuildRecord = async () => {
    try {
      const response = await api.get(`/api/builder/builds/${id}`);
      setBuild(response.data);
      if (response.data.status === 'SUCCESS') {
        setProgress(100);
        setStage('Completed successfully');
      } else if (response.data.status === 'FAILED') {
        setProgress(100);
        setStage('Compilation failed');
      }
    } catch (error) {
      console.warn('Failed to load build details from database. Setting up simulated stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildRecord();

    // Establish live Server-Sent Events listener
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const sseUrl = `${serverUrl}/api/builder/status/${id}`;
    console.log(`[SSE Client] Subscribing to: ${sseUrl}`);

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE Client] Received progress stream:', data);

        if (data.progress !== undefined) {
          setProgress(data.progress);
        }

        if (data.stage) {
          setStage(data.stage);
          setSseLogs((prev) => [...prev, `[Build] ${data.stage}...`]);
        }

        if (data.status === 'SUCCESS' && data.apkUrl) {
          setSseLogs((prev) => [...prev, `[S3] Artifact uploaded successfully: ${data.apkUrl}`]);
          setBuild((prev) => prev ? { ...prev, status: 'SUCCESS', apkUrl: data.apkUrl } : null);
          eventSource.close();
        }

        if (data.status === 'FAILED') {
          setSseLogs((prev) => [...prev, `[Error] Compilation crashed: ${data.error || 'General build failure'}`]);
          setBuild((prev) => prev ? { ...prev, status: 'FAILED', errorLog: data.error } : null);
          eventSource.close();
        }
      } catch (e) {
        console.error('SSE JSON error parse:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('[SSE Client] SSE connection closed or offline.');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Pre-load static mock value in case backend fails
  const appTitle = build?.appName || 'My Native App';
  const targetUrl = build?.websiteUrl || 'https://mywebsite.com';
  const buildStatus = build?.status || (progress === 100 ? 'SUCCESS' : 'BUILDING');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/builder" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" /> Build Tracker: {appTitle}
          </h1>
          <p className="text-xs text-gray-500">Realtime tracking status of your active WebView compilation wrapper.</p>
        </div>
      </div>

      {/* Progress Core Card */}
      <div className="p-8 rounded-2xl glass-panel border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Pipeline Stage</div>
            <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              {buildStatus === 'BUILDING' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
              {stage}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Progress</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{progress}%</div>
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Success Trigger */}
        {buildStatus === 'SUCCESS' && (
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="text-xs font-bold text-white">APK Compiled Successfully!</div>
                <div className="text-[10px] text-gray-500">Your signed release package is prepared for download.</div>
              </div>
            </div>
            <a
              href={build?.apkUrl || '#'}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-600/10"
            >
              <Download className="w-4 h-4" /> Download Signed APK
            </a>
          </div>
        )}

        {/* Failure Trigger */}
        {buildStatus === 'FAILED' && (
          <div className="p-5 rounded-xl border border-red-500/20 bg-red-950/10 flex flex-col justify-between gap-3 text-left">
            <div className="flex items-center gap-3 text-red-400 font-bold text-xs">
              <AlertTriangle className="w-5 h-5" /> Compilation Process Interrupted
            </div>
            <pre className="p-4 rounded-lg bg-black text-gray-400 font-mono text-[10px] max-h-44 overflow-y-auto leading-relaxed border border-white/5">
              {build?.errorLog || 'Standard Gradle error. Verify target website URL connection state or certificate passwords.'}
            </pre>
          </div>
        )}
      </div>

      {/* Terminal log panel */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5 bg-gray-950/20">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-indigo-400" /> Compilation Logs Stream
        </h3>
        
        <div className="p-4 rounded-xl bg-black font-mono text-[11px] text-gray-400 space-y-2 h-64 overflow-y-auto leading-relaxed border border-white/5">
          {sseLogs.map((log, idx) => (
            <div key={idx} className="transition-all duration-200">
              <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
          {buildStatus === 'BUILDING' && (
            <div className="text-indigo-400 animate-pulse mt-2 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling release modules...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
