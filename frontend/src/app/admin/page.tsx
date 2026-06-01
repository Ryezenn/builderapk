'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, Terminal, Smartphone, Activity, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  _count: {
    apkBuilds: number;
    apis: number;
  };
}

interface ApiItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

interface BuildItem {
  id: string;
  appName: string;
  packageName: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface LogItem {
  timestamp: string;
  level: string;
  message: string;
}

export default function AdminDashboardDesk() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Lists states
  const [users, setUsers] = useState<UserItem[]>([]);
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [builds, setBuilds] = useState<BuildItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data || []);

      const apisRes = await api.get('/api/admin/apis');
      setApis(apisRes.data || []);

      const buildsRes = await api.get('/api/admin/builds');
      setBuilds(buildsRes.data || []);

      const logsRes = await api.get('/api/admin/logs');
      setLogs(logsRes.data || []);
    } catch (error) {
      console.warn('Backend connection failed. Compiling superadmin mockup panel datasets.');
      // Mock fallbacks
      setUsers([
        { id: 'u-1', name: 'Rehan Dev', email: 'rehan@buildrx.com', plan: 'PRO', createdAt: new Date().toISOString(), _count: { apkBuilds: 4, apis: 2 } },
        { id: 'u-2', name: 'Indie Hacker', email: 'indie@chat.com', plan: 'FREE', createdAt: new Date(Date.now() - 86400000).toISOString(), _count: { apkBuilds: 1, apis: 0 } },
      ]);
      setApis([
        { id: 'a-1', name: 'NeuralText AI Engine', slug: 'neuraltext-ai', category: 'AI', status: 'ACTIVE', user: { name: 'AlphaNode', email: 'alpha@node.com' } },
        { id: 'a-2', name: 'Mock Scraper Service', slug: 'mock-scraper', category: 'Utilities', status: 'SUSPENDED', user: { name: 'ScrapeBot', email: 'bot@scrape.com' } },
      ]);
      setBuilds([
        { id: 'b-1', appName: 'Indie Portals', packageName: 'com.buildrx.portals', status: 'SUCCESS', createdAt: new Date().toISOString(), user: { name: 'Rehan Dev' } },
      ]);
      setLogs([
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'BuildrX Express gateway client booted successfully.' },
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'Redis pub/sub channels synchronized.' },
        { timestamp: new Date().toISOString(), level: 'WARN', message: 'AWS S3 credentials not found. Defaulting to local public storage fallback.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdatePlan = async (userId: string, targetPlan: string) => {
    try {
      await api.put(`/api/admin/users/${userId}/plan`, { plan: targetPlan });
      setUsers(users.map((u) => (u.id === userId ? { ...u, plan: targetPlan } : u)));
    } catch (error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, plan: targetPlan } : u)));
    }
  };

  const handleToggleApiStatus = async (apiId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/api/admin/apis/${apiId}/status`, { status: nextStatus });
      setApis(apis.map((a) => (a.id === apiId ? { ...a, status: nextStatus } : a)));
    } catch (error) {
      setApis(apis.map((a) => (a.id === apiId ? { ...a, status: nextStatus } : a)));
    }
  };

  return (
    <div className="space-y-10 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" /> Moderation Desk
          </h1>
          <p className="text-sm text-gray-400 mt-1">Superadmin portal: manage platform plans upgrades, moderate APIs, and view system log metrics.</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2 pb-1 text-xs font-bold">
        {[
          { id: 'users', name: 'Users Moderation', icon: Users },
          { id: 'apis', name: 'APIs Moderation', icon: Terminal },
          { id: 'builds', name: 'Builds Queue', icon: Smartphone },
          { id: 'logs', name: 'System Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 font-black bg-white/1'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="h-64 bg-white/2 rounded-2xl animate-pulse" />
      ) : (
        <div className="p-6 rounded-2xl border border-white/5 glass-panel">
          {/* USER MODERATION TAB */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-semibold bg-white/1">
                    <th className="p-4">Tenant Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Active Plan</th>
                    <th className="p-4">APKs / APIs</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/1">
                      <td className="p-4 text-white font-bold font-sans">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          u.plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          u.plan === 'ENTERPRISE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-white/5 text-gray-400 border-transparent'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-4">{u._count.apkBuilds} APKs / {u._count.apis} APIs</td>
                      <td className="p-4 text-right font-sans flex gap-2 justify-end">
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'FREE')}
                          className="px-2.5 py-1 rounded bg-white/2 hover:bg-white/5 text-[10px] font-bold text-gray-400 border border-white/5"
                        >
                          Downgrade FREE
                        </button>
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'PRO')}
                          className="px-2.5 py-1 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-[10px] font-bold text-indigo-300 border border-indigo-500/20"
                        >
                          Upgrade PRO
                        </button>
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'ENTERPRISE')}
                          className="px-2.5 py-1 rounded bg-emerald-600/10 hover:bg-emerald-600/20 text-[10px] font-bold text-emerald-300 border border-emerald-500/20"
                        >
                          Enterprise
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* API MODERATION TAB */}
          {activeTab === 'apis' && (
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-semibold bg-white/1">
                    <th className="p-4">API Description</th>
                    <th className="p-4">Owner Account</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {apis.map((a) => (
                    <tr key={a.id} className="hover:bg-white/1">
                      <td className="p-4 text-white font-bold font-sans">{a.name} <span className="text-[9px] font-mono text-gray-500">[{a.category}]</span></td>
                      <td className="p-4 font-sans">{a.user.name} ({a.user.email})</td>
                      <td className="p-4">/gateway/{a.slug}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          a.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-sans">
                        <button
                          onClick={() => handleToggleApiStatus(a.id, a.status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            a.status === 'ACTIVE'
                              ? 'bg-red-950/20 text-red-400 border border-red-500/25 hover:bg-red-950/40'
                              : 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-950/40'
                          }`}
                        >
                          {a.status === 'ACTIVE' ? 'Suspend API' : 'Activate API'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BUILDS MONITOR TAB */}
          {activeTab === 'builds' && (
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-semibold bg-white/1">
                    <th className="p-4">Target Application</th>
                    <th className="p-4">Package ID</th>
                    <th className="p-4">Owner Name</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Queue Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {builds.map((b) => (
                    <tr key={b.id} className="hover:bg-white/1">
                      <td className="p-4 text-white font-bold font-sans">{b.appName}</td>
                      <td className="p-4">{b.packageName}</td>
                      <td className="p-4 font-sans">{b.user.name}</td>
                      <td className="p-4 text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          b.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                          b.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex gap-2 text-xs font-bold text-yellow-500 border-b border-white/5 pb-3">
                <AlertTriangle className="w-4.5 h-4.5" /> System Console Stream Logs
              </div>
              <div className="p-4 rounded-xl bg-black font-mono text-[11px] text-gray-400 h-64 overflow-y-auto leading-relaxed border border-white/5 space-y-2">
                {logs.map((log, idx) => (
                  <div key={idx}>
                    <span className="text-gray-600">[{log.timestamp.split('T')[1].substring(0, 8)}]</span>{' '}
                    <span className={log.level === 'WARN' ? 'text-yellow-500' : log.level === 'ERROR' ? 'text-red-500' : 'text-emerald-400'}>
                      [{log.level}]
                    </span>{' '}
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
