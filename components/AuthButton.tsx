'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AuthButton() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  if (status === 'loading') {
    return (
      <div 
        className="w-8 h-8 rounded-full animate-pulse"
        style={{ backgroundColor: theme.colors.bgSecondary }}
      />
    );
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="px-4 py-2 rounded-lg font-medium transition-all"
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.textOnPrimary,
        }}
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-1.5 rounded-full transition-all hover:opacity-80"
        style={{ backgroundColor: theme.colors.bgSecondary }}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            {session.user?.name?.charAt(0)?.toUpperCase() || 
             session.user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{ 
              backgroundColor: theme.colors.cardBg,
              boxShadow: theme.effects.shadowLg,
              border: `1px solid ${theme.colors.cardBorder}`,
            }}
          >
            <div 
              className="px-4 py-3 border-b"
              style={{ borderColor: theme.colors.cardBorder }}
            >
              <p 
                className="text-sm font-medium truncate"
                style={{ color: theme.colors.textPrimary }}
              >
                {session.user?.name || 'Reader'}
              </p>
              <p 
                className="text-xs truncate"
                style={{ color: theme.colors.textMuted }}
              >
                {session.user?.email}
              </p>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm transition-all hover:opacity-80"
                style={{ 
                  color: theme.colors.textPrimary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.bgSecondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
