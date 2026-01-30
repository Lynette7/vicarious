'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

function SignInForm() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
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
          <div className="text-5xl mb-4">📚</div>
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ 
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.heading,
            }}
          >
            Welcome Back
          </h1>
          <p 
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Sign in to continue your reading journey
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

        {/* Sign in form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
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

        {/* Sign up link */}
        <p 
          className="text-center text-sm"
          style={{ color: theme.colors.textSecondary }}
        >
          Don&apos;t have an account?{' '}
          <Link 
            href="/auth/signup"
            className="font-semibold hover:underline"
            style={{ color: theme.colors.primary }}
          >
            Sign up
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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
