'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Network error connecting to authentication service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12" dir="ltr">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-white p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.jpeg"
            alt="Red Dragon Study Logo"
            className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-brand-700 shadow"
          />
          <h1 className="text-2xl font-extrabold text-slate-900">Red Dragon Study</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Employee & Administrator Portal
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم المستخدم أو البريد (Username / Email)
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute top-3 left-3.5" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              كلمة المرور (Password)
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute top-3 left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 py-3 text-sm font-bold text-white shadow hover:bg-brand-800 disabled:opacity-50 transition"
          >
            {loading ? 'Signing In...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-brand-700">
            ← Return to Public Student Website
          </Link>
        </div>
      </div>
    </div>
  );
}
