'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { Settings, Shield, User, KeyRound, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');

    setTimeout(() => {
      setSavingProfile(false);
      setProfileMsg('Display name configuration updated successfully.');
    }, 1000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg('');

    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please fill in both fields.');
      setSavingPassword(false);
      return;
    }

    setTimeout(() => {
      setSavingPassword(false);
      setPasswordMsg('Secure login credentials updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    }, 1000);
  };

  return (
    <div className="space-y-10 max-w-4xl text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" /> Profile Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">Configure your personal profiles settings and modify authentication parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-2">
            <User className="w-4.5 h-4.5 text-indigo-400" /> Account Profile
          </h2>

          {profileMsg && (
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 text-xs font-semibold">
              {profileMsg}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-gray-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl glass-input"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-400">Secure Email</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-3 rounded-xl glass-input bg-black/40 text-gray-500 cursor-not-allowed border-dashed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* Password Reset Card */}
        <form onSubmit={handleUpdatePassword} className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-2">
            <KeyRound className="w-4.5 h-4.5 text-indigo-400" /> Security Credentials
          </h2>

          {passwordMsg && (
            <div className="p-3 rounded-lg border border-white/5 bg-white/1 text-indigo-300 text-xs font-semibold">
              {passwordMsg}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-gray-400">Current Active Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 rounded-xl glass-input"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-400">New Secure Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-xl glass-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
