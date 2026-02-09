'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';

interface Bookshop {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating?: number;
  ratingCount?: number;
  placeId: string;
  googleMapsUri?: string;
  website?: string;
}

interface Library {
  id: string;
  name: string;
  address: string;
  distance: number;
  availabilityStatus?: 'available' | 'checked_out' | 'unknown';
  placeId: string;
  googleMapsUri?: string;
  website?: string;
}

interface BookAvailability {
  isbn?: string;
  title: string;
  author: string;
  bookshops: Bookshop[];
  libraries: Library[];
  onlineOptions: {
    bookshopOrg?: string;
    amazonSearch?: string;
    openLibrary?: string;
    worldCat?: string;
    googleBooks?: string;
    libbySearch?: string;
  };
}

interface BookFinderProps {
  bookTitle: string;
  author: string;
  country: string;
  onClose: () => void;
}

export default function BookFinder({ bookTitle, author, country, onClose }: BookFinderProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<BookAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get user's location
      let lat: number | undefined;
      let lng: number | undefined;

      // First, try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            fetchAvailability(position.coords.latitude, position.coords.longitude);
          },
          () => {
            // Geolocation failed, try saved location
            fetchAvailabilityFromProfile();
          }
        );
      } else {
        // No geolocation, try saved location
        fetchAvailabilityFromProfile();
      }
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load book availability. Please set your location in settings.');
      setLoading(false);
    }
  };

  const fetchAvailability = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/books/find-nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookTitle, author, lat, lng }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to find nearby locations. Please check your location settings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityFromProfile = async () => {
    try {
      const res = await fetch('/api/user/location');
      if (res.ok) {
        const location = await res.json();
        if (location.locationLat && location.locationLng) {
          setUserLocation({
            lat: location.locationLat,
            lng: location.locationLng,
          });
          await fetchAvailability(location.locationLat, location.locationLng);
          return;
        }
      }
      setError('Location not set. Please set your location in settings to find nearby bookshops and libraries.');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching location from profile:', err);
      setError('Please set your location in settings.');
      setLoading(false);
    }
  };

  const openDirections = (place: { googleMapsUri?: string; placeId: string; name: string; address: string }) => {
    if (place.googleMapsUri) {
      window.open(place.googleMapsUri, '_blank');
    } else {
      // Fallback: search Google Maps by name and address
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.address)}`, '_blank');
    }
  };

  if (!session?.user) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div
          className="rounded-xl shadow-xl p-6 w-full max-w-md"
          style={{
            backgroundColor: theme.colors.modalBg,
            boxShadow: theme.effects.shadowLg,
          }}
        >
          <p style={{ color: theme.colors.textSecondary }}>
            Please sign in to use the book finder feature.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div
        className="rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto my-4"
        style={{
          backgroundColor: theme.colors.modalBg,
          boxShadow: theme.effects.shadowLg,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold mb-1"
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.heading,
              }}
            >
              Find "{bookTitle}"
            </h2>
            <p
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              by {author} • {country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
            <p className="mt-4" style={{ color: theme.colors.textSecondary }}>
              Finding nearby bookshops and libraries...
            </p>
          </div>
        )}

        {error && (
          <div
            className="p-4 rounded-lg mb-4"
            style={{
              backgroundColor: `${theme.colors.accent}20`,
              border: `1px solid ${theme.colors.accent}`,
            }}
          >
            <p style={{ color: theme.colors.textPrimary }}>{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary,
              }}
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && availability && (
          <div className="space-y-6">
            {/* Bookshops */}
            <div>
              <h3
                className="text-lg font-bold mb-3"
                style={{ color: theme.colors.textPrimary }}
              >
                🏪 Bookshops Nearby
              </h3>
              {availability.bookshops.length > 0 ? (
                <div className="space-y-3">
                  {availability.bookshops.slice(0, 5).map((shop) => (
                    <div
                      key={shop.id}
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.cardBg,
                        border: `1px solid ${theme.colors.cardBorder}`,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4
                            className="font-semibold mb-1"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {shop.name}
                          </h4>
                          <p
                            className="text-sm mb-2"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {shop.address}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span style={{ color: theme.colors.textMuted }}>
                              📍 {shop.distance.toFixed(1)} mi away
                            </span>
                            {shop.rating && (
                              <span style={{ color: theme.colors.textMuted }}>
                                ⭐ {shop.rating.toFixed(1)}
                                {shop.ratingCount && ` (${shop.ratingCount})`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-4">
                          <button
                            onClick={() => openDirections(shop)}
                            className="px-3 py-1.5 rounded text-sm font-medium"
                            style={{
                              backgroundColor: theme.colors.primary,
                              color: theme.colors.textOnPrimary,
                            }}
                          >
                            Directions
                          </button>
                          {shop.website && (
                            <a
                              href={shop.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded text-xs font-medium text-center"
                              style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme.colors.cardBorder}`,
                                color: theme.colors.textSecondary,
                              }}
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: theme.colors.textMuted }}>
                  No nearby bookshops found. Try the online options below.
                </p>
              )}
            </div>

            {/* Libraries */}
            <div>
              <h3
                className="text-lg font-bold mb-3"
                style={{ color: theme.colors.textPrimary }}
              >
                📖 Libraries Nearby
              </h3>
              {availability.libraries.length > 0 ? (
                <div className="space-y-3">
                  {availability.libraries.slice(0, 5).map((lib) => (
                    <div
                      key={lib.id}
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.cardBg,
                        border: `1px solid ${theme.colors.cardBorder}`,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4
                            className="font-semibold mb-1"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {lib.name}
                          </h4>
                          <p
                            className="text-sm mb-2"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {lib.address}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span style={{ color: theme.colors.textMuted }}>
                              📍 {lib.distance.toFixed(1)} mi away
                            </span>
                            {lib.availabilityStatus === 'available' && (
                              <span style={{ color: '#22c55e' }}>✅ Available</span>
                            )}
                            {lib.availabilityStatus === 'checked_out' && (
                              <span style={{ color: '#f59e0b' }}>⏳ On Hold</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-4">
                          <button
                            onClick={() => openDirections(lib)}
                            className="px-3 py-1.5 rounded text-sm font-medium"
                            style={{
                              backgroundColor: theme.colors.primary,
                              color: theme.colors.textOnPrimary,
                            }}
                          >
                            Directions
                          </button>
                          {lib.website && (
                            <a
                              href={lib.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded text-xs font-medium text-center"
                              style={{
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme.colors.cardBorder}`,
                                color: theme.colors.textSecondary,
                              }}
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: theme.colors.textMuted }}>
                  No nearby libraries found. Try the online options below.
                </p>
              )}
            </div>

            {/* Online Options */}
            <div>
              <h3
                className="text-lg font-bold mb-3"
                style={{ color: theme.colors.textPrimary }}
              >
                🌐 Online Options
              </h3>
              {availability.isbn && (
                <p className="text-xs mb-3" style={{ color: theme.colors.textMuted }}>
                  ISBN: {availability.isbn}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availability.onlineOptions.bookshopOrg && (
                  <a
                    href={availability.onlineOptions.bookshopOrg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.textOnPrimary,
                    }}
                  >
                    📚 Bookshop.org
                  </a>
                )}
                {availability.onlineOptions.amazonSearch && (
                  <a
                    href={availability.onlineOptions.amazonSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      backgroundColor: '#FF9900',
                      color: '#000',
                    }}
                  >
                    🛒 Amazon
                  </a>
                )}
                {availability.onlineOptions.openLibrary && (
                  <a
                    href={availability.onlineOptions.openLibrary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.textOnPrimary,
                    }}
                  >
                    📖 Open Library
                  </a>
                )}
                {availability.onlineOptions.worldCat && (
                  <a
                    href={availability.onlineOptions.worldCat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${theme.colors.cardBorder}`,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    🌍 WorldCat
                  </a>
                )}
                {availability.onlineOptions.googleBooks && (
                  <a
                    href={availability.onlineOptions.googleBooks}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${theme.colors.cardBorder}`,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    📕 Google Books
                  </a>
                )}
                {availability.onlineOptions.libbySearch && (
                  <a
                    href={availability.onlineOptions.libbySearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${theme.colors.cardBorder}`,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    📱 Libby
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
