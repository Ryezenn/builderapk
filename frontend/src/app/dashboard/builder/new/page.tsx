'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import {
  ArrowLeft,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Compass,
  FileCheck,
  Palette,
  Sparkles
} from 'lucide-react';

export default function NewBuildWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Basic Info
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [packageName, setPackageName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);

  // Step 2: Appearance
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [statusBar, setStatusBar] = useState('dark'); // dark, light, transparent
  const [orientation, setOrientation] = useState('portrait'); // portrait, landscape, auto

  // Step 3: Features
  const [allowBack, setAllowBack] = useState(true);
  const [offlinePage, setOfflinePage] = useState(false);
  const [fileUpload, setFileUpload] = useState(true);
  const [cameraAccess, setCameraAccess] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [customUserAgent, setCustomUserAgent] = useState('');
  const [customCss, setCustomCss] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate package name from app name
  useEffect(() => {
    if (appName) {
      const cleanName = appName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      setPackageName(`com.buildrx.${cleanName || 'myapp'}`);
    } else {
      setPackageName('');
    }
  }, [appName]);

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!appName || !websiteUrl || !packageName) {
        setErrorMsg('Please populate all basic info parameters.');
        return;
      }
      try {
        new URL(websiteUrl);
      } catch (e) {
        setErrorMsg('Please specify a valid website URL address (e.g. https://google.com).');
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

    const payload = {
      appName,
      packageName,
      websiteUrl,
      themeColor,
      statusBar,
      orientation,
      allowBack,
      offlinePage,
      version,
      versionCode,
    };

    try {
      const response = await api.post('/api/builder/build', payload);
      const buildRecord = response.data.build;
      router.push(`/dashboard/builder/${buildRecord.id}`);
    } catch (err: any) {
      console.warn('Backend build trigger failed. Navigating to builds list directory.');
      router.push('/dashboard/builder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/builder" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Convert Web to APK
          </h1>
          <p className="text-xs text-gray-500">Configure your application wrapper details, compile native binaries and download packages.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Workspace split */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side Wizard Configuration panels */}
        <div className="flex-1 w-full p-8 rounded-2xl glass-panel border border-white/5 space-y-8">
          {/* Step indicators */}
          <div className="flex justify-between items-center pb-6 border-b border-white/5">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' :
                  step > num ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-500'
                }`}>
                  {num}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                  step === num ? 'text-white' : 'text-gray-500'
                }`}>
                  {num === 1 ? 'Basic Info' : num === 2 ? 'Theme Style' : num === 3 ? 'Features' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          {/* Form Step Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5"><Compass className="w-4 h-4 text-indigo-400" /> Basic App Details</h2>
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Application Title Name</label>
                  <input
                    type="text"
                    placeholder="e.g. My SaaS Portal"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Target Website URL</label>
                  <input
                    type="url"
                    placeholder="https://mysaas.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Android Package Name ID</label>
                  <input
                    type="text"
                    placeholder="com.buildrx.saasapp"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-400">App Version String</label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-400">Build Version Code</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={versionCode}
                      onChange={(e) => setVersionCode(parseInt(e.target.value) || 1)}
                      className="w-full p-3 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5"><Palette className="w-4 h-4 text-indigo-400" /> Color & Theme Customizer</h2>
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Branding Theme Accent Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-12 bg-transparent border-0 cursor-pointer rounded-xl"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="p-3 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Native Status Bar Layout</label>
                  <select
                    value={statusBar}
                    onChange={(e) => setStatusBar(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-gray-300"
                  >
                    <option value="dark">Match Theme Color (Dark Icons)</option>
                    <option value="light">Match Theme Color (Light Icons)</option>
                    <option value="black">Deep Matte Black</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-400">Force Screen Orientation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['portrait', 'landscape', 'sensor'].map((or) => (
                      <button
                        key={or}
                        onClick={() => setOrientation(or)}
                        className={`p-3 rounded-xl text-center font-bold capitalize transition-all border ${
                          orientation === or ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300' : 'border-white/5 hover:bg-white/2 text-gray-400'
                        }`}
                      >
                        {or}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-indigo-400" /> Functional Permissions</h2>
              <div className="space-y-4">
                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/1 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-white">Device Hardware Back Button</div>
                      <div className="text-[10px] text-gray-500">Enable physical back button to navigate backwards in web history.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowBack}
                      onChange={(e) => setAllowBack(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-black border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/1 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-white">Connection Fail Offline Fallback</div>
                      <div className="text-[10px] text-gray-500">Inject offline.html fallbacks in case network connection fails.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={offlinePage}
                      onChange={(e) => setOfflinePage(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-black border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/1 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-white">Camera Hardware Access Permission</div>
                      <div className="text-[10px] text-gray-500">Enable permission strings to use camera features in forms.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cameraAccess}
                      onChange={(e) => setCameraAccess(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-black border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-semibold text-gray-400">Custom User-Agent Suffix Suffix</label>
                  <input
                    type="text"
                    placeholder="e.g. BuildrX/1.0"
                    value={customUserAgent}
                    onChange={(e) => setCustomUserAgent(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Compile Specification Summary</h2>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-white/1 border border-white/5 space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Application Name:</span>
                    <span className="text-white font-bold">{appName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Android ID:</span>
                    <span className="text-indigo-300 font-mono">{packageName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Core URL:</span>
                    <span className="text-white truncate max-w-xs font-mono">{websiteUrl}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Accent:</span>
                    <span className="font-mono text-white flex items-center gap-1.5">
                      <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: themeColor }} /> {themeColor}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Feature Tags:</span>
                    <span className="text-white">
                      {offlinePage ? 'Offline fallback, ' : ''} {cameraAccess ? 'Camera, ' : ''} WebView Native
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 leading-relaxed bg-white/1 p-3.5 rounded-xl border border-white/5">
                  🛡️ Compilations take ~2-4 minutes under load. Your generated APK files will be signed using a platform release key and uploaded to cloud storages dynamically.
                </div>
              </div>
            </div>
          )}

          {/* Navigation action buttons */}
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

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
              >
                Next Phase <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? 'Queueing Compilation Task...' : <><Smartphone className="w-4 h-4" /> Trigger APK Build</>}
              </button>
            )}
          </div>
        </div>

        {/* Right Side Panel - Live Phone Mockup */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col items-center">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Live Phone Mockup</div>
          <div className="w-72 h-[520px] rounded-[36px] bg-black border-[10px] border-gray-900 p-2.5 relative flex flex-col justify-between shadow-2xl overflow-hidden shadow-black/80">
            {/* Status bar */}
            <div className="h-6 flex justify-between px-4 items-center text-[10px] font-bold select-none z-20">
              <span className={statusBar === 'light' ? 'text-gray-300' : 'text-black'}>09:41</span>
              <div className="flex gap-1.5 items-center">
                <span className={statusBar === 'light' ? 'text-gray-300' : 'text-black'}>📶 🔋</span>
              </div>
            </div>

            {/* App UI frame */}
            <div className="flex-1 rounded-[24px] overflow-hidden bg-[#0a0f1d] border border-white/5 flex flex-col justify-between relative">
              {/* WebView Header reflecting selections */}
              <div
                className="h-12 flex items-center px-4 justify-between transition-all select-none z-10"
                style={{ backgroundColor: themeColor }}
              >
                <span className="text-white text-xs font-extrabold truncate max-w-[150px]">{appName || 'WebView application'}</span>
                <span className="text-white text-[10px]">⋮</span>
              </div>

              {/* WebView Body containing mock interface */}
              <div className="flex-1 p-4 flex flex-col justify-center items-center text-center select-none bg-slate-950">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 mb-4 animate-pulse">
                  🌐
                </div>
                <div className="text-xs text-gray-300 font-extrabold truncate max-w-[180px]">{websiteUrl || 'Injecting URL Target...'}</div>
                <p className="text-[9px] text-gray-600 mt-2 px-4 leading-relaxed">
                  Reflecting custom permissions and bridges on compile.
                </p>
              </div>

              {/* WebView Bottom Navigation bar */}
              <div className="h-10 bg-black/60 backdrop-blur-md flex items-center justify-around text-gray-500 text-[10px] select-none">
                <span className={allowBack ? 'text-indigo-400' : 'text-gray-700'}>◀ Back</span>
                <span>⌂ Home</span>
                <span>⬜ Apps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
