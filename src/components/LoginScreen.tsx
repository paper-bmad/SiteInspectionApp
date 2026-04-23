import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isDemoMode = authService.isDemoMode();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 header-gradient rounded-2xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gradient mb-2">BuildwellAI</h1>
          <p className="text-gray-600">Compliance &amp; Site Inspection Platform</p>
        </div>

        {isDemoMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-800">
            <strong>Demo mode</strong> — Supabase not configured.{' '}
            Use <code className="font-mono">test / test</code> to sign in.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {isDemoMode ? 'Username' : 'Email address'}
            </label>
            <input
              id="email"
              type={isDemoMode ? 'text' : 'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder={isDemoMode ? 'test' : 'you@buildwell.ai'}
              autoComplete="email"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          BuildwellAI v1.1.0 — UK Building Regulations Compliance
        </p>
      </div>
    </div>
  );
}
