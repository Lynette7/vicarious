'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function SignUpPage() {
  const { theme } = useTheme();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but failed to sign in. Please try signing in manually.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: theme.colors.bgGradient }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl"
        style={{ 
          backgroundColor: theme.colors.cardBg,
          boxShadow: theme.effects.shadowLg,
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌍</div>
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ 
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.heading,
            }}
          >
            Join the Journey
          </h1>
          <p 
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Create an account to start tracking your reading
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ 
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {/* Sign up form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.textPrimary,
              }}
              placeholder="Your name"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.textPrimary,
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.textPrimary,
              }}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.textPrimary,
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div 
            className="flex-1 h-px"
            style={{ backgroundColor: theme.colors.cardBorder }}
          />
          <span 
            className="px-4 text-sm"
            style={{ color: theme.colors.textMuted }}
          >
            or
          </span>
          <div 
            className="flex-1 h-px"
            style={{ backgroundColor: theme.colors.cardBorder }}
          />
        </div>

        {/* Sign in link */}
        <p 
          className="text-center text-sm"
          style={{ color: theme.colors.textSecondary }}
        >
          Already have an account?{' '}
          <Link 
            href="/auth/signin"
            className="font-semibold hover:underline"
            style={{ color: theme.colors.primary }}
          >
            Sign in
          </Link>
        </p>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="text-sm hover:underline"
            style={{ color: theme.colors.textMuted }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
