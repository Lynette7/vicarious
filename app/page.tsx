'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const GlobeComponent = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-slate-900 to-black flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Loading globe...</div>
    </div>
  ),
});
import BookList from '@/components/BookList';
import AddBookModal from '@/components/AddBookModal';
import PassportModal from '@/components/PassportModal';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import AuthButton from '@/components/AuthButton';
import AIRecommendations from '@/components/AIRecommendations';
import LocationSettings from '@/components/LocationSettings';
import { useTheme } from '@/context/ThemeContext';
import { getBooks as getLocalBooks, getBooksByCountry as getLocalBooksByCountry } from '@/lib/storage';
import { Book } from '@/types';
import { getCountryName, getCountryCode } from '@/lib/countries';
import { BookRecommendation } from '@/components/RecommendationCard';

export default function Home() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isLocationSettingsOpen, setIsLocationSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load books from API or localStorage
  const loadBooks = useCallback(async () => {
    if (status === 'loading') return;
    
    if (session?.user) {
      // User is authenticated - fetch from API
      setLoading(true);
      try {
        const res = await fetch('/api/books');
        if (res.ok) {
          const apiBooks = await res.json();
          // Transform API books to match our Book type
          const transformedBooks: Book[] = apiBooks.map((b: {
            id: string;
            title: string;
            author: string;
            countryCode: string;
            countryName: string;
            dateRead: string;
            rating?: number;
            notes?: string;
          }) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            countryCode: b.countryCode,
            countryName: b.countryName,
            dateRead: b.dateRead,
            rating: b.rating,
            notes: b.notes,
          }));
          setBooks(transformedBooks);
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest user - use localStorage
      const localBooks = getLocalBooks();
      setBooks(localBooks);
    }
  }, [session, status]);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, sidebar should be open by default
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load books when session changes
  useEffect(() => {
    if (mounted && status !== 'loading') {
      loadBooks();
    }
  }, [mounted, status, loadBooks]);

  const updateSelectedBooks = (allBooks: Book[], countryCode?: string) => {
    if (countryCode) {
      const filtered = allBooks.filter(book => book.countryCode === countryCode);
      setSelectedBooks(filtered);
    } else {
      setSelectedBooks([]);
    }
  };

  const handleCountryClick = (countryCode: string, countryName: string) => {
    setSelectedCountry(countryCode);
    updateSelectedBooks(books, countryCode);
    // On mobile, open sidebar when country is selected
    if (isMobile) {
      setIsSidebarOpen(true);
    }
  };

  const handleCountrySelectFromSidebar = (countryCode: string) => {
    const countryName = getCountryName(countryCode);
    handleCountryClick(countryCode, countryName);
  };

  const handleBookAdded = () => {
    loadBooks();
  };

  const handleBookDeleted = () => {
    loadBooks();
  };

  const handleAddBookFromRecommendation = (recommendation: BookRecommendation) => {
    // Pre-fill the add book modal with recommendation data
    setSelectedCountry(getCountryCode(recommendation.country) || undefined);
    setIsAddModalOpen(true);
    // Note: We'd need to modify AddBookModal to accept initial values
    // For now, user will need to manually enter the book
  };

  // Calculate books by country from the books state
  const booksByCountry: Record<string, Book[]> = {};
  books.forEach((book) => {
    if (!booksByCountry[book.countryCode]) {
      booksByCountry[book.countryCode] = [];
    }
    booksByCountry[book.countryCode].push(book);
  });
  
  const booksCountByCountry: Record<string, number> = {};
  Object.entries(booksByCountry).forEach(([code, countryBooks]) => {
    booksCountByCountry[code] = countryBooks.length;
  });

  const totalBooks = books.length;
  const totalCountries = mounted ? Object.keys(booksCountByCountry).length : 0;

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: theme.colors.bgGradient }}
    >
      {/* Header */}
      <header 
        className="shadow-md z-30 flex-shrink-0"
        style={{ 
          backgroundColor: theme.colors.cardBg,
          boxShadow: theme.effects.shadow,
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            {/* Logo & Title */}
            <div className="min-w-0 flex-shrink">
              <h1 
                className={`text-lg sm:text-2xl md:text-3xl font-bold truncate ${
                  theme.id === 'renaissance' ? 'antique-text' : 
                  theme.id === 'modern' ? 'cyber-gradient' : 
                  theme.id === 'library' ? 'brass-text' : ''
                }`}
                style={{ 
                  color: (theme.id === 'modern' || theme.id === 'library') ? undefined : theme.colors.textPrimary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                <span className="hidden sm:inline">
                  {theme.id === 'renaissance' ? '📜 ' : 
                   theme.id === 'modern' ? '🚀 ' : 
                   theme.id === 'library' ? '📚 ' : '🌍 '}
                </span>
                {theme.id === 'renaissance' ? 'A Literary Voyage' : 
                 theme.id === 'modern' ? 'Global Reader' : 
                 theme.id === 'library' ? 'The Reading Room' : 'Around the World in Books'}
              </h1>
              <p 
                className={`text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block ${
                  theme.id === 'renaissance' ? 'italic' : 
                  theme.id === 'library' ? 'italic' : ''
                }`}
                style={{ 
                  color: theme.colors.textSecondary,
                  fontFamily: theme.id === 'renaissance' ? theme.fonts.body : 
                              theme.id === 'modern' ? theme.fonts.accent : 
                              theme.id === 'library' ? theme.fonts.accent : undefined,
                  letterSpacing: theme.id === 'modern' ? '0.1em' : 
                                 theme.id === 'library' ? '0.05em' : undefined,
                  textTransform: theme.id === 'modern' ? 'uppercase' as const : undefined,
                  fontSize: theme.id === 'modern' ? '0.65rem' : undefined,
                }}
              >
                {theme.id === 'renaissance' ? '~ Anno Domini MMXXVI ~' : 
                 theme.id === 'modern' ? '// READING CHALLENGE 2026' : 
                 theme.id === 'library' ? 'A Scholar\'s Journey Through World Literature' : 'Your Reading Journey in 2026'}
              </p>
            </div>
            
            {/* Stats & Actions */}
            <div className="flex gap-2 sm:gap-4 items-center flex-shrink-0">
              {/* Stats - Hidden on mobile */}
              <div className="hidden md:flex gap-4">
                <div className="text-right">
                  <div 
                    className="text-xl lg:text-2xl font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    {totalBooks}
                  </div>
                  <div 
                    className="text-xs lg:text-sm"
                    style={{ color: theme.colors.textMuted }}
                  >
                    Books Read
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="text-xl lg:text-2xl font-bold"
                    style={{ color: theme.colors.accent }}
                  >
                    {totalCountries}
                  </div>
                  <div 
                    className="text-xs lg:text-sm"
                    style={{ color: theme.colors.textMuted }}
                  >
                    Countries
                  </div>
                </div>
              </div>
              
              {/* Theme Switcher */}
              <ThemeSwitcher />
              
              {/* Passport Button */}
              <button
                onClick={() => setIsPassportOpen(true)}
                className={`p-2.5 sm:px-4 sm:py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
                  theme.id === 'renaissance' ? 'velvet-button' : 
                  theme.id === 'modern' ? 'holo-button' : 
                  theme.id === 'library' ? 'scholarly-button' : ''
                }`}
                style={{
                  background: (theme.id === 'renaissance' || theme.id === 'modern' || theme.id === 'library') ? undefined : theme.colors.passportCover,
                  color: theme.colors.passportText,
                  borderRadius: theme.borderRadius.lg,
                }}
                title={theme.id === 'renaissance' ? 'My Ledger' : 
                       theme.id === 'library' ? 'Library Card' : 'My Passport'}
              >
                <span>
                  {theme.id === 'renaissance' ? '📖' : 
                   theme.id === 'modern' ? '🛂' : 
                   theme.id === 'library' ? '🪪' : '📕'}
                </span>
                <span className="hidden sm:inline">
                  {theme.id === 'renaissance' ? 'My Ledger' : 
                   theme.id === 'library' ? 'Library Card' : 'Passport'}
                </span>
              </button>
              
              {/* Add Book Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="p-2.5 sm:px-4 sm:py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.textOnPrimary,
                }}
                title="Add Book"
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ Add Book</span>
              </button>
              
              {/* Location Settings Button */}
              {session?.user && (
                <button
                  onClick={() => setIsLocationSettingsOpen(true)}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.colors.cardBorder}`,
                    color: theme.colors.textSecondary,
                  }}
                  title="Set Location"
                >
                  <span className="text-lg">📍</span>
                  <span className="hidden sm:inline ml-1 text-sm">Location</span>
                </button>
              )}
              
              {/* Auth Button */}
              <AuthButton />
            </div>
          </div>
          
          {/* Mobile Stats Bar */}
          <div className="flex md:hidden justify-center gap-6 mt-2 pt-2 border-t" style={{ borderColor: theme.colors.cardBorder }}>
            <div className="flex items-center gap-2">
              <span 
                className="text-lg font-bold"
                style={{ color: theme.colors.primary }}
              >
                {totalBooks}
              </span>
              <span 
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Books
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-lg font-bold"
                style={{ color: theme.colors.accent }}
              >
                {totalCountries}
              </span>
              <span 
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Countries
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Globe Section */}
        <div className="flex-1 relative min-w-0">
          <GlobeComponent
            booksByCountry={booksCountByCountry}
            selectedCountry={selectedCountry}
            onCountryClick={handleCountryClick}
          />
          
          {/* Instructions - Hidden on mobile, shown on larger screens */}
          <div 
            className={`absolute top-4 left-4 rounded-lg p-3 sm:p-4 max-w-[200px] sm:max-w-xs z-10 hidden sm:block ${
              theme.id === 'renaissance' ? 'corner-flourishes illuminated-border' : 
              theme.id === 'modern' ? 'glass-card pixel-corners' : 
              theme.id === 'library' ? 'leather-card bookmark-ribbon' : ''
            }`}
            style={{
              backgroundColor: theme.id === 'modern' ? undefined : theme.colors.cardBg,
              boxShadow: theme.effects.shadowLg,
              borderRadius: theme.borderRadius.lg,
            }}
          >
            <h2 
              className={`font-bold text-sm sm:text-lg mb-2 ${
                theme.id === 'renaissance' ? 'gold-shimmer' : 
                theme.id === 'modern' ? 'cyber-gradient' : 
                theme.id === 'library' ? 'brass-text' : ''
              }`}
              style={{ 
                color: (theme.id === 'renaissance' || theme.id === 'modern' || theme.id === 'library') ? undefined : theme.colors.textPrimary,
                fontFamily: theme.fonts.heading,
              }}
            >
              {theme.id === 'renaissance' ? '✦ Guidance ✦' : 
               theme.id === 'modern' ? '> CONTROLS_' : 
               theme.id === 'library' ? '§ Quick Reference' : 'Instructions'}
            </h2>
            <ul 
              className="text-xs sm:text-sm space-y-1"
              style={{ 
                color: theme.colors.textSecondary,
                fontFamily: theme.id === 'renaissance' ? theme.fonts.body : 
                            theme.id === 'modern' ? 'monospace' : 
                            theme.id === 'library' ? theme.fonts.body : undefined,
                fontSize: theme.id === 'modern' ? '0.7rem' : undefined,
              }}
            >
              {theme.id === 'renaissance' ? (
                <>
                  <li>❧ Rotate the orb with thy cursor</li>
                  <li>❧ Scroll to magnify</li>
                  <li>❧ Select a realm to explore</li>
                  <li>❧ Chronicle thy readings!</li>
                </>
              ) : theme.id === 'modern' ? (
                <>
                  <li>↻ drag to rotate</li>
                  <li>⊕ scroll to zoom</li>
                  <li>◉ click to select</li>
                  <li>+ add books to log</li>
                </>
              ) : theme.id === 'library' ? (
                <>
                  <li>§1. Drag to rotate the globe</li>
                  <li>§2. Scroll to zoom in/out</li>
                  <li>§3. Click to select a region</li>
                  <li>§4. Catalog your readings</li>
                </>
              ) : (
                <>
                  <li>• Rotate: Click and drag</li>
                  <li>• Zoom: Scroll</li>
                  <li>• Select: Click a country</li>
                  <li>• Add books to track your journey!</li>
                </>
              )}
            </ul>
          </div>
          
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute bottom-4 right-4 md:hidden z-30 p-4 rounded-full shadow-lg transition-all"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {isSidebarOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-4 z-30 p-3 rounded-full transition-all duration-300 hidden md:block ${
            isSidebarOpen ? 'right-[25rem] lg:right-[26.5rem]' : 'right-4'
          }`}
          style={{
            backgroundColor: theme.colors.cardBg,
            boxShadow: theme.effects.shadow,
          }}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform duration-300 ${
              isSidebarOpen ? 'rotate-0' : 'rotate-180'
            }`}
            style={{ color: theme.colors.textSecondary }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Mobile Sidebar Backdrop */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed md:relative inset-y-0 right-0 z-50 md:z-20
            flex-shrink-0 
            transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'w-[85vw] sm:w-80 md:w-96 lg:w-[25rem]' 
              : 'w-0'
            }
          `}
          style={{
            backgroundColor: isSidebarOpen ? theme.colors.cardBg : 'transparent',
            boxShadow: isSidebarOpen ? theme.effects.shadowLg : 'none',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar inner content wrapper - ensures content doesn't show when collapsed */}
          <div 
            className={`h-full flex flex-col w-[85vw] sm:w-80 md:w-96 lg:w-[25rem] ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ 
              backgroundColor: theme.colors.cardBg,
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Mobile Sidebar Header */}
            <div 
              className="flex md:hidden items-center justify-between p-4 border-b flex-shrink-0"
              style={{ borderColor: theme.colors.cardBorder }}
            >
              <h2 
                className="text-lg font-bold"
                style={{ 
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                {selectedCountry ? getCountryName(selectedCountry) : 'Countries'}
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg"
                style={{ color: theme.colors.textMuted }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {/* AI Recommendations Section */}
            {!selectedCountry && (
              <div className="mb-6">
                <AIRecommendations onAddBook={handleAddBookFromRecommendation} />
              </div>
            )}

            {selectedCountry ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 
                    className="text-xl sm:text-2xl font-bold hidden md:block"
                    style={{ 
                      color: theme.colors.textPrimary,
                      fontFamily: theme.fonts.heading,
                    }}
                  >
                    {getCountryName(selectedCountry)}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedCountry(undefined);
                      setSelectedBooks([]);
                    }}
                    className="text-lg sm:text-xl font-bold transition-colors hidden md:block"
                    style={{ color: theme.colors.textMuted }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div 
                  className="mb-4 text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {selectedBooks.length} {selectedBooks.length === 1 ? 'book' : 'books'} from this country
                </div>
                <BookList books={selectedBooks} onBookDeleted={handleBookDeleted} />
                
                {/* Mobile back button */}
                <button
                  onClick={() => {
                    setSelectedCountry(undefined);
                    setSelectedBooks([]);
                  }}
                  className="mt-4 w-full py-3 rounded-lg font-medium md:hidden"
                  style={{
                    border: `1px solid ${theme.colors.cardBorder}`,
                    color: theme.colors.textSecondary,
                  }}
                >
                  ← Back to Countries
                </button>
              </>
            ) : (
              <div>
                <div className="text-center py-4 sm:py-6 mb-4 sm:mb-6">
                  <div className={`text-4xl sm:text-6xl mb-3 sm:mb-4 ${
                    theme.id === 'renaissance' ? 'float-flourish' : 
                    theme.id === 'modern' ? 'float-modern pulse-glow inline-block rounded-full p-2' : 
                    theme.id === 'library' ? 'lamp-glow inline-block' : ''
                  }`}>
                    {theme.id === 'renaissance' ? '🗺️' : 
                     theme.id === 'modern' ? '🛰️' : 
                     theme.id === 'library' ? '🌍' : '🌎'}
                  </div>
                  <h2 
                    className={`text-xl sm:text-2xl font-bold mb-2 hidden md:block ${
                      theme.id === 'renaissance' ? 'gold-shimmer' : 
                      theme.id === 'modern' ? 'cyber-gradient' : 
                      theme.id === 'library' ? 'brass-text' : ''
                    }`}
                    style={{ 
                      color: (theme.id === 'renaissance' || theme.id === 'modern' || theme.id === 'library') ? undefined : theme.colors.textPrimary,
                      fontFamily: theme.fonts.heading,
                    }}
                  >
                    {theme.id === 'renaissance' ? 'Choose Thy Realm' : 
                     theme.id === 'modern' ? 'SELECT_REGION' : 
                     theme.id === 'library' ? 'Card Catalog' : 'Select a Country'}
                  </h2>
                  <p 
                    className={`text-sm ${(theme.id === 'renaissance' || theme.id === 'library') ? 'italic' : ''}`}
                    style={{ 
                      color: theme.colors.textSecondary,
                      fontFamily: theme.id === 'renaissance' ? theme.fonts.body : 
                                  theme.id === 'modern' ? 'monospace' : 
                                  theme.id === 'library' ? theme.fonts.accent : undefined,
                      fontSize: theme.id === 'modern' ? '0.7rem' : undefined,
                      letterSpacing: theme.id === 'modern' ? '0.05em' : undefined,
                    }}
                  >
                    {theme.id === 'renaissance' 
                      ? 'Click upon a land to discover its treasures' 
                      : theme.id === 'modern' 
                      ? '// tap to initialize data stream' 
                      : theme.id === 'library'
                      ? 'Browse the collection by region'
                      : 'Click on a country to explore!'}
                  </p>
                  {theme.id === 'renaissance' && (
                    <div className="renaissance-divider mt-4">
                      <span>❦</span>
                    </div>
                  )}
                  {theme.id === 'modern' && (
                    <div className="mt-4 h-px w-full" style={{
                      background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)'
                    }} />
                  )}
                  {theme.id === 'library' && (
                    <div className="library-divider mt-4">
                      <span>📖</span>
                    </div>
                  )}
                </div>
                
                {totalBooks > 0 ? (
                  <div>
                    <h3 
                      className={`font-semibold mb-3 sm:mb-4 text-base sm:text-lg ${
                        theme.id === 'renaissance' ? 'text-center' : 
                        theme.id === 'modern' ? 'text-center' : 
                        theme.id === 'library' ? 'text-center brass-text' : ''
                      }`}
                      style={{ 
                        color: theme.id === 'library' ? undefined : theme.colors.textPrimary,
                        fontFamily: theme.fonts.heading,
                        letterSpacing: theme.id === 'modern' ? '0.05em' : undefined,
                      }}
                    >
                      {theme.id === 'renaissance' 
                        ? `📚 Realms Explored (${totalCountries})` 
                        : theme.id === 'modern'
                        ? `◉ LOGGED_REGIONS [${totalCountries}]`
                        : theme.id === 'library'
                        ? `§ Cataloged Regions (${totalCountries})`
                        : `Countries with Books (${totalCountries})`}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(booksCountByCountry)
                        .sort(([, a], [, b]) => b - a)
                        .map(([code, count]) => (
                          <button
                            key={code}
                            onClick={() => handleCountrySelectFromSidebar(code)}
                            className={`w-full flex justify-between items-center p-3 rounded-lg transition-all ${
                              theme.id === 'renaissance' ? 'renaissance-card' : 
                              theme.id === 'modern' ? 'modern-card' : 
                              theme.id === 'library' ? 'book-spine catalog-card' : 'hover:scale-[1.01]'
                            }`}
                            style={{
                              border: `1px solid ${theme.colors.cardBorder}`,
                              borderRadius: theme.borderRadius.lg,
                              backgroundColor: theme.colors.cardBg,
                            }}
                          >
                            <span 
                              className="font-medium text-sm sm:text-base"
                              style={{ 
                                color: theme.colors.textPrimary,
                                fontFamily: (theme.id === 'renaissance' || theme.id === 'library') ? theme.fonts.body : undefined,
                              }}
                            >
                              {getCountryName(code)}
                            </span>
                            <span 
                              className={`font-semibold px-2 py-1 rounded text-sm ${
                                theme.id === 'renaissance' ? 'wax-seal text-xs' : 
                                theme.id === 'modern' ? 'tech-badge' : 
                                theme.id === 'library' ? 'dewey-badge' : ''
                              }`}
                              style={{ 
                                color: theme.id === 'renaissance' ? '#ffd700' : 
                                       theme.id === 'modern' ? theme.colors.primary : 
                                       theme.id === 'library' ? theme.colors.textOnPrimary : theme.colors.primary,
                                backgroundColor: theme.id === 'renaissance' ? undefined : 
                                                theme.id === 'modern' ? undefined : 
                                                theme.id === 'library' ? undefined : theme.colors.primaryLight,
                                width: theme.id === 'renaissance' ? '2rem' : undefined,
                                height: theme.id === 'renaissance' ? '2rem' : undefined,
                                fontSize: theme.id === 'renaissance' ? '0.7rem' : 
                                          theme.id === 'modern' ? '0.75rem' : undefined,
                                fontFamily: theme.id === 'modern' ? 'monospace' : 
                                           theme.id === 'library' ? theme.fonts.accent : undefined,
                              }}
                            >
                              {theme.id === 'modern' ? `×${count}` : 
                               theme.id === 'library' ? `vol.${count}` : count}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-center py-6 sm:py-8"
                    style={{ color: theme.colors.textMuted }}
                  >
                    <p className="mb-4 text-sm sm:text-base">No books added yet.</p>
                    <p className="text-xs sm:text-sm">Add your first book to start tracking your reading journey!</p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
        defaultCountry={selectedCountry ? getCountryName(selectedCountry) : ''}
      />

      {/* Passport Modal */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        books={books}
        booksByCountry={booksByCountry}
      />

      {/* Location Settings Modal */}
      <LocationSettings
        isOpen={isLocationSettingsOpen}
        onClose={() => setIsLocationSettingsOpen(false)}
      />
    </div>
  );
}
