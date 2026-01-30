'use client';

import { useState, useMemo } from 'react';
import { Book } from '@/types';
import { getCountryName } from '@/lib/countries';
import { getContinent, CONTINENT_COLORS, CONTINENT_EMOJIS, CONTINENTS } from '@/lib/continents';
import { getUnlockedAchievements, getNextAchievements, TIER_COLORS, PassportStats } from '@/lib/achievements';
import { useTheme } from '@/context/ThemeContext';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  booksByCountry: Record<string, Book[]>;
}

export default function PassportModal({ isOpen, onClose, books, booksByCountry }: PassportModalProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState<'cover' | 'stamps' | 'achievements' | 'stats'>('cover');

  const stats: PassportStats = useMemo(() => {
    const countryCodes = Object.keys(booksByCountry);
    const continentsVisited = Array.from(new Set(countryCodes.map(code => getContinent(code)))).filter(c => c !== 'Unknown');
    
    const countriesPerContinent: Record<string, number> = {};
    countryCodes.forEach(code => {
      const continent = getContinent(code);
      if (continent !== 'Unknown') {
        countriesPerContinent[continent] = (countriesPerContinent[continent] || 0) + 1;
      }
    });

    return {
      totalBooks: books.length,
      totalCountries: countryCodes.length,
      continentsVisited,
      countriesPerContinent,
    };
  }, [books, booksByCountry]);

  const unlockedAchievements = useMemo(() => getUnlockedAchievements(stats), [stats]);
  const nextAchievements = useMemo(() => getNextAchievements(stats), [stats]);

  if (!isOpen) return null;

  const isRenaissance = theme.id === 'renaissance';
  const isModern = theme.id === 'modern';
  const isLibrary = theme.id === 'library';

  const renderCover = () => (
    <div 
      className={`relative h-full flex flex-col items-center justify-center rounded-lg p-4 sm:p-8 text-center overflow-hidden ${
        isRenaissance ? 'corner-flourishes' : 
        isModern ? 'data-stream' : 
        isLibrary ? 'leather-card' : ''
      }`}
      style={{ background: theme.colors.passportCover }}
    >
      {/* Renaissance decorative background */}
      {isRenaissance && (
        <>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffd700' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-2 left-2 text-2xl opacity-30">⚜️</div>
          <div className="absolute top-2 right-2 text-2xl opacity-30">⚜️</div>
          <div className="absolute bottom-2 left-2 text-2xl opacity-30 rotate-180">⚜️</div>
          <div className="absolute bottom-2 right-2 text-2xl opacity-30 rotate-180">⚜️</div>
        </>
      )}
      
      {/* Modern decorative background */}
      {isModern && (
        <>
          <div className="absolute inset-0 opacity-20 pointer-events-none hex-pattern" />
          <div className="absolute top-2 left-2 text-lg opacity-50" style={{ fontFamily: 'monospace', color: theme.colors.passportAccent }}>{'<>'}</div>
          <div className="absolute top-2 right-2 text-lg opacity-50" style={{ fontFamily: 'monospace', color: theme.colors.passportAccent }}>{'</>'}</div>
          <div className="absolute bottom-2 left-2 text-lg opacity-50" style={{ fontFamily: 'monospace', color: theme.colors.passportAccent }}>{'{}'}</div>
          <div className="absolute bottom-2 right-2 text-lg opacity-50" style={{ fontFamily: 'monospace', color: theme.colors.passportAccent }}>{'[]'}</div>
        </>
      )}
      
      {/* Library decorative background */}
      {isLibrary && (
        <>
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='8' height='18' x='2' y='1' fill='%23d4a84b' rx='1'/%3E%3Crect width='6' height='16' x='12' y='2' fill='%23d4a84b' rx='1'/%3E%3Crect width='10' height='18' x='20' y='1' fill='%23d4a84b' rx='1'/%3E%3Crect width='5' height='14' x='32' y='3' fill='%23d4a84b' rx='1'/%3E%3Crect width='9' height='17' x='39' y='1.5' fill='%23d4a84b' rx='1'/%3E%3Crect width='7' height='15' x='50' y='2.5' fill='%23d4a84b' rx='1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 40px',
            }}
          />
          <div className="absolute top-2 left-2 text-xl opacity-40">📖</div>
          <div className="absolute top-2 right-2 text-xl opacity-40">📖</div>
          <div className="absolute bottom-2 left-2 text-xl opacity-40">✒️</div>
          <div className="absolute bottom-2 right-2 text-xl opacity-40">✒️</div>
        </>
      )}
      
      {/* Passport emblem */}
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2">
        <div 
          className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg ${
            isRenaissance ? 'wax-seal' : 
            isModern ? 'pulse-glow' : 
            isLibrary ? 'library-stamp lamp-glow' : ''
          }`}
          style={{ 
            background: isRenaissance ? undefined : 
                        isModern ? 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #f472b6 100%)' :
                        isLibrary ? `linear-gradient(135deg, ${theme.colors.primary}, #1a3a2f)` :
                        `linear-gradient(135deg, ${theme.colors.passportAccent}, ${theme.colors.accent})`,
            width: isRenaissance ? '5rem' : undefined,
            height: isRenaissance ? '5rem' : undefined,
          }}
        >
          <span className="text-3xl sm:text-5xl">
            {isRenaissance ? '✒️' : isModern ? '🌐' : isLibrary ? '🎓' : '📚'}
          </span>
        </div>
      </div>
      
      {/* Title */}
      <div className="mt-16 sm:mt-20 space-y-1 sm:space-y-2">
        <h2 
          className={`text-xs sm:text-sm font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase ${
            isModern ? 'typing-cursor' : ''
          }`}
          style={{ 
            color: theme.colors.passportAccent,
            fontFamily: isModern ? 'monospace' : isLibrary ? theme.fonts.accent : undefined,
          }}
        >
          {isRenaissance ? '~ The Literary ~' : 
           isModern ? '// DIGITAL' : 
           isLibrary ? '§ Reader\'s' : 'Literary'}
        </h2>
        <h1 
          className={`text-2xl sm:text-4xl font-bold tracking-wide ${
            isRenaissance ? 'gold-shimmer' : 
            isModern ? 'cyber-gradient' : 
            isLibrary ? 'brass-text' : ''
          }`}
          style={{ 
            color: (isRenaissance || isModern || isLibrary) ? undefined : theme.colors.passportText,
            fontFamily: theme.fonts.heading,
          }}
        >
          {isRenaissance ? 'LEDGER' : isLibrary ? 'LIBRARY CARD' : 'PASSPORT'}
        </h1>
        <div 
          className={`w-20 sm:w-32 h-1 mx-auto mt-3 sm:mt-4 ${isModern ? 'rounded-full' : ''}`}
          style={{ 
            backgroundColor: isModern ? undefined : theme.colors.passportAccent,
            background: isModern ? 'linear-gradient(90deg, #22d3ee, #a78bfa, #f472b6)' : undefined,
          }}
        />
        {isRenaissance && (
          <p className="text-xs mt-4 opacity-70 italic" style={{ color: theme.colors.passportText }}>
            "A reader lives a thousand lives"
          </p>
        )}
        {isModern && (
          <p className="text-xs mt-4 opacity-70" style={{ color: theme.colors.passportText, fontFamily: 'monospace' }}>
            {'> your global reading access_'}
          </p>
        )}
        {isLibrary && (
          <p className="text-xs mt-4 opacity-70 italic" style={{ color: theme.colors.passportText, fontFamily: theme.fonts.accent }}>
            "The world is a book, and those who do not travel read only one page."
          </p>
        )}
      </div>

      {/* Stats preview */}
      <div 
        className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-6"
        style={{ color: theme.colors.passportText }}
      >
        <div className={`text-center ${isModern ? 'tech-badge p-2 rounded-lg' : isLibrary ? 'p-2' : ''}`}>
          <div 
            className={`text-xl sm:text-3xl font-bold ${isModern ? 'neon-text' : ''}`}
            style={{ 
              color: theme.colors.passportAccent,
              fontFamily: isModern ? theme.fonts.accent : isLibrary ? theme.fonts.heading : undefined,
            }}
          >
            {stats.totalCountries}
          </div>
          <div 
            className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80"
            style={{ fontFamily: isModern ? 'monospace' : isLibrary ? theme.fonts.accent : undefined }}
          >
            {isRenaissance ? 'Realms' : isModern ? 'ENTRIES' : isLibrary ? 'Regions' : 'Countries'}
          </div>
        </div>
        <div className={`text-center ${isModern ? 'tech-badge p-2 rounded-lg' : isLibrary ? 'p-2' : ''}`}>
          <div 
            className={`text-xl sm:text-3xl font-bold ${isModern ? 'neon-text' : ''}`}
            style={{ 
              color: theme.colors.passportAccent,
              fontFamily: isModern ? theme.fonts.accent : isLibrary ? theme.fonts.heading : undefined,
            }}
          >
            {stats.totalBooks}
          </div>
          <div 
            className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80"
            style={{ fontFamily: isModern ? 'monospace' : isLibrary ? theme.fonts.accent : undefined }}
          >
            {isRenaissance ? 'Tomes' : isModern ? 'VISAS' : isLibrary ? 'Volumes' : 'Books'}
          </div>
        </div>
        <div className={`text-center ${isModern ? 'tech-badge p-2 rounded-lg' : isLibrary ? 'p-2' : ''}`}>
          <div 
            className={`text-xl sm:text-3xl font-bold ${isModern ? 'neon-text' : ''}`}
            style={{ 
              color: theme.colors.passportAccent,
              fontFamily: isModern ? theme.fonts.accent : isLibrary ? theme.fonts.heading : undefined,
            }}
          >
            {stats.continentsVisited.length}
          </div>
          <div 
            className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80"
            style={{ fontFamily: isModern ? 'monospace' : isLibrary ? theme.fonts.accent : undefined }}
          >
            {isRenaissance ? 'Lands' : isModern ? 'REGIONS' : isLibrary ? 'Sections' : 'Continents'}
          </div>
        </div>
      </div>

      {/* Year */}
      <div 
        className="mt-8 sm:mt-12 text-xs sm:text-sm tracking-widest opacity-60"
        style={{ 
          color: theme.colors.passportText,
          fontFamily: isRenaissance ? theme.fonts.accent : isModern ? 'monospace' : undefined,
        }}
      >
        {isRenaissance ? '❦ ANNO DOMINI MMXXVI ❦' : 
         isModern ? '// VERSION 2026.0' : 'READING JOURNEY 2026'}
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute bottom-4 left-4 w-8 sm:w-12 h-8 sm:h-12 border-2 rounded-full opacity-30"
        style={{ borderColor: theme.colors.passportAccent }}
      />
      <div 
        className="absolute bottom-8 right-8 w-6 sm:w-8 h-6 sm:h-8 border-2 rounded-full opacity-30"
        style={{ borderColor: theme.colors.passportAccent }}
      />
    </div>
  );

  const renderStamps = () => (
    <div 
      className="h-full overflow-y-auto rounded-lg p-4 sm:p-6"
      style={{ background: theme.colors.bgGradient }}
    >
      <h2 
        className="text-xl sm:text-2xl font-bold mb-2 text-center"
        style={{ 
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.heading,
        }}
      >
        🛂 Visa Stamps
      </h2>
      <p 
        className="text-center text-xs sm:text-sm mb-4 sm:mb-6"
        style={{ color: theme.colors.textSecondary }}
      >
        Your literary journey around the world
      </p>
      
      {Object.keys(booksByCountry).length === 0 ? (
        <div 
          className="text-center py-8 sm:py-12"
          style={{ color: theme.colors.textMuted }}
        >
          <div className="text-4xl sm:text-6xl mb-4">📭</div>
          <p>No stamps yet!</p>
          <p className="text-sm mt-2">Add books to start collecting stamps</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Object.entries(booksByCountry).map(([countryCode, countryBooks]) => {
            const continent = getContinent(countryCode);
            const continentColor = CONTINENT_COLORS[continent] || '#6b7280';
            const firstBook = countryBooks[0];
            const dateStamp = firstBook?.dateRead 
              ? new Date(firstBook.dateRead).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : '2026';

            return (
              <div 
                key={countryCode}
                className="relative p-3 sm:p-4 rounded-lg border-4 border-dashed transform hover:scale-105 transition-transform"
                style={{ 
                  borderColor: continentColor,
                  backgroundColor: `${continentColor}15`,
                }}
              >
                <div className="text-center">
                  <div 
                    className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-white mb-1 sm:mb-2"
                    style={{ backgroundColor: continentColor }}
                  >
                    {continent}
                  </div>
                  <div 
                    className="text-lg sm:text-2xl font-bold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {getCountryName(countryCode)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1 sm:mt-2">
                    <span className="text-base sm:text-lg">{CONTINENT_EMOJIS[continent] || '🌍'}</span>
                    <span 
                      className="text-xs sm:text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {countryBooks.length} book{countryBooks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div 
                    className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-mono"
                    style={{ color: theme.colors.textMuted }}
                  >
                    📅 {dateStamp}
                  </div>
                </div>

                <div 
                  className="absolute inset-0 rounded-lg opacity-10 pointer-events-none"
                  style={{
                    background: `repeating-linear-gradient(45deg, ${continentColor}, ${continentColor} 2px, transparent 2px, transparent 8px)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <div 
      className="h-full overflow-y-auto rounded-lg p-4 sm:p-6"
      style={{ background: theme.colors.bgGradient }}
    >
      <h2 
        className="text-xl sm:text-2xl font-bold mb-2 text-center"
        style={{ 
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.heading,
        }}
      >
        🏅 Achievements
      </h2>
      <p 
        className="text-center text-xs sm:text-sm mb-4 sm:mb-6"
        style={{ color: theme.colors.textSecondary }}
      >
        {unlockedAchievements.length} of {unlockedAchievements.length + nextAchievements.length + 10} unlocked
      </p>

      {unlockedAchievements.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h3 
            className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2"
            style={{ color: theme.colors.textPrimary }}
          >
            <span>✨</span> Unlocked
          </h3>
          <div className="grid gap-2 sm:gap-3">
            {unlockedAchievements.map((achievement) => {
              const tierStyle = TIER_COLORS[achievement.tier];
              return (
                <div
                  key={achievement.id}
                  className={`p-3 sm:p-4 rounded-xl border-2 ${tierStyle.bg} ${tierStyle.border} flex items-center gap-3 sm:gap-4 transform hover:scale-[1.02] transition-transform`}
                >
                  <div className="text-2xl sm:text-4xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm sm:text-base truncate ${tierStyle.text}`}>
                      {achievement.name}
                    </div>
                    <div 
                      className="text-xs sm:text-sm truncate"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {achievement.description}
                    </div>
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold uppercase ${tierStyle.text}`}>
                    {achievement.tier}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {nextAchievements.length > 0 && (
        <div>
          <h3 
            className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2"
            style={{ color: theme.colors.textPrimary }}
          >
            <span>🔒</span> Up Next
          </h3>
          <div className="grid gap-2 sm:gap-3">
            {nextAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-3 sm:p-4 rounded-xl border-2 flex items-center gap-3 sm:gap-4 opacity-60"
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <div className="text-2xl sm:text-4xl grayscale">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-bold text-sm sm:text-base truncate"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {achievement.name}
                  </div>
                  <div 
                    className="text-xs sm:text-sm truncate"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlockedAchievements.length === 0 && (
        <div 
          className="text-center py-6 sm:py-8"
          style={{ color: theme.colors.textMuted }}
        >
          <div className="text-4xl sm:text-6xl mb-4">🎯</div>
          <p>No achievements yet!</p>
          <p className="text-sm mt-2">Start reading to unlock badges</p>
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div 
      className="h-full overflow-y-auto rounded-lg p-4 sm:p-6"
      style={{ background: theme.colors.bgGradient }}
    >
      <h2 
        className="text-xl sm:text-2xl font-bold mb-2 text-center"
        style={{ 
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.heading,
        }}
      >
        📊 Journey Stats
      </h2>
      <p 
        className="text-center text-xs sm:text-sm mb-4 sm:mb-6"
        style={{ color: theme.colors.textSecondary }}
      >
        Your reading adventure breakdown
      </p>

      {/* Continent progress */}
      <div className="mb-6 sm:mb-8">
        <h3 
          className="text-base sm:text-lg font-semibold mb-3 sm:mb-4"
          style={{ color: theme.colors.textPrimary }}
        >
          Continents Explored
        </h3>
        <div className="grid gap-2 sm:gap-3">
          {CONTINENTS.filter(c => c !== 'Antarctica').map((continent) => {
            const count = stats.countriesPerContinent[continent] || 0;
            const isVisited = count > 0;
            const color = CONTINENT_COLORS[continent];
            
            return (
              <div key={continent} className="flex items-center gap-2 sm:gap-3">
                <div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-2xl flex-shrink-0 ${isVisited ? '' : 'grayscale opacity-50'}`}
                  style={{ backgroundColor: isVisited ? `${color}30` : theme.colors.bgTertiary }}
                >
                  {CONTINENT_EMOJIS[continent]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span 
                      className="font-medium text-sm sm:text-base truncate"
                      style={{ color: isVisited ? theme.colors.textPrimary : theme.colors.textMuted }}
                    >
                      {continent}
                    </span>
                    <span 
                      className="font-bold text-xs sm:text-sm flex-shrink-0 ml-2"
                      style={{ color: isVisited ? color : theme.colors.textMuted }}
                    >
                      {count}
                    </span>
                  </div>
                  <div 
                    className="h-1.5 sm:h-2 rounded-full mt-1 overflow-hidden"
                    style={{ backgroundColor: theme.colors.bgTertiary }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(count * 10, 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading highlights */}
      <div 
        className="rounded-xl p-3 sm:p-4"
        style={{ 
          backgroundColor: theme.colors.cardBg,
          boxShadow: theme.effects.shadow,
        }}
      >
        <h3 
          className="text-base sm:text-lg font-semibold mb-2 sm:mb-3"
          style={{ color: theme.colors.textPrimary }}
        >
          📈 Highlights
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
          <div 
            className="p-2 sm:p-3 rounded-lg"
            style={{ backgroundColor: theme.colors.primaryLight }}
          >
            <div 
              className="text-lg sm:text-2xl font-bold"
              style={{ color: theme.colors.primary }}
            >
              {stats.totalBooks}
            </div>
            <div 
              className="text-[10px] sm:text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              Total Books
            </div>
          </div>
          <div 
            className="p-2 sm:p-3 rounded-lg"
            style={{ backgroundColor: `${theme.colors.accent}20` }}
          >
            <div 
              className="text-lg sm:text-2xl font-bold"
              style={{ color: theme.colors.accent }}
            >
              {stats.totalCountries}
            </div>
            <div 
              className="text-[10px] sm:text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              Countries
            </div>
          </div>
          <div 
            className="p-2 sm:p-3 rounded-lg"
            style={{ backgroundColor: theme.colors.bgSecondary }}
          >
            <div 
              className="text-lg sm:text-2xl font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              {stats.continentsVisited.length}
            </div>
            <div 
              className="text-[10px] sm:text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              Continents
            </div>
          </div>
          <div 
            className="p-2 sm:p-3 rounded-lg"
            style={{ backgroundColor: theme.colors.bgSecondary }}
          >
            <div 
              className="text-lg sm:text-2xl font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              {unlockedAchievements.length}
            </div>
            <div 
              className="text-[10px] sm:text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              Achievements
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div 
        className="rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden"
        style={{ 
          backgroundColor: theme.colors.cardBg,
          boxShadow: theme.effects.shadowLg,
        }}
      >
        {/* Navigation tabs */}
        <div 
          className="flex border-b flex-shrink-0"
          style={{ 
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.cardBorder,
          }}
        >
          {[
            { key: 'cover', label: isRenaissance ? '📜' : isModern ? '🛂' : isLibrary ? '🪪' : '📕', fullLabel: isRenaissance ? 'Folio' : isModern ? 'ID' : isLibrary ? 'Card' : 'Cover', page: 'cover' as const },
            { key: 'stamps', label: isRenaissance ? '🔖' : isModern ? '📍' : isLibrary ? '📚' : '🛂', fullLabel: isRenaissance ? 'Seals' : isModern ? 'Visas' : isLibrary ? 'Catalog' : 'Stamps', page: 'stamps' as const },
            { key: 'achievements', label: isRenaissance ? '🏆' : isModern ? '⚡' : isLibrary ? '🎓' : '🏅', fullLabel: isRenaissance ? 'Honours' : isModern ? 'Perks' : isLibrary ? 'Awards' : 'Badges', page: 'achievements' as const },
            { key: 'stats', label: isRenaissance ? '📋' : isModern ? '📈' : isLibrary ? '📊' : '📊', fullLabel: isRenaissance ? 'Ledger' : isModern ? 'Stats' : isLibrary ? 'Records' : 'Stats', page: 'stats' as const },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentPage(tab.page)}
              className="flex-1 py-2.5 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium transition-colors"
              style={{
                backgroundColor: currentPage === tab.page ? theme.colors.cardBg : 'transparent',
                color: currentPage === tab.page ? theme.colors.primary : theme.colors.textMuted,
                borderBottom: currentPage === tab.page ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              }}
            >
              <span className="sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.label} {tab.fullLabel}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-2 sm:p-4">
          {currentPage === 'cover' && renderCover()}
          {currentPage === 'stamps' && renderStamps()}
          {currentPage === 'achievements' && renderAchievements()}
          {currentPage === 'stats' && renderStats()}
        </div>

        {/* Close button */}
        <div 
          className="p-3 sm:p-4 border-t flex-shrink-0"
          style={{ 
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.cardBorder,
          }}
        >
          <button
            onClick={onClose}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isRenaissance ? 'vintage-button' : 
              isModern ? 'holo-button' : 
              isLibrary ? 'scholarly-button' : ''
            }`}
            style={{
              backgroundColor: (isRenaissance || isModern || isLibrary) ? undefined : theme.colors.primary,
              color: theme.colors.textOnPrimary,
              fontFamily: isModern ? 'monospace' : isLibrary ? theme.fonts.body : undefined,
            }}
          >
            {isRenaissance ? '❦ Close Ledger ❦' : 
             isModern ? '[ CLOSE_PASSPORT ]' : 
             isLibrary ? '§ Return to Reading' : 'Close Passport'}
          </button>
        </div>
      </div>
    </div>
  );
}
