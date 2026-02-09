'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';

interface LocationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationSettings({ isOpen, onClose }: LocationSettingsProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session?.user) {
      loadLocation();
    }
  }, [isOpen, session]);

  const loadLocation = async () => {
    try {
      const res = await fetch('/api/user/location');
      if (res.ok) {
        const data = await res.json();
        setCity(data.locationCity || '');
        setLat(data.locationLat || null);
        setLng(data.locationLng || null);
      }
    } catch (err) {
      console.error('Error loading location:', err);
    }
  };

  const handleUseCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setLat(newLat);
        setLng(newLng);

        // Use OpenStreetMap Nominatim for reverse geocoding (no API key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
          if (cityName) {
            setCity(cityName);
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
        }

        setLoading(false);
      },
      () => {
        setError('Failed to get your location. Please enter a city name manually.');
        setLoading(false);
      }
    );
  };

  const handleLookupCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Use OpenStreetMap Nominatim for forward geocoding (no API key needed)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
        setCity(data[0].display_name.split(',')[0]); // Use the normalized name
      } else {
        setError('Could not find coordinates for that city. Please try a different name.');
      }
    } catch (err) {
      console.error('Error looking up city:', err);
      setError('Failed to look up city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/user/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city || undefined,
          lat: lat || undefined,
          lng: lng || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save location');
      }

      onClose();
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
      <div
        className="rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md"
        style={{
          backgroundColor: theme.colors.modalBg,
          boxShadow: theme.effects.shadowLg,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.heading,
            }}
          >
            Set Your Location
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p
          className="text-sm mb-4"
          style={{ color: theme.colors.textSecondary }}
        >
          Set your location to find nearby bookshops and libraries when getting book recommendations.
        </p>

        {error && (
          <div
            className="p-3 rounded-lg mb-4"
            style={{
              backgroundColor: `${theme.colors.accent}20`,
              border: `1px solid ${theme.colors.accent}`,
            }}
          >
            <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
              {error}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: theme.colors.textSecondary }}
            >
              City
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLookupCity(); }}
                className="flex-1 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.colors.inputBg,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary,
                }}
                placeholder="e.g., New York, London, Nairobi"
              />
              <button
                onClick={handleLookupCity}
                disabled={loading || !city.trim()}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  border: `1px solid ${theme.colors.cardBorder}`,
                  color: theme.colors.textSecondary,
                }}
              >
                Look up
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: theme.colors.textMuted }}>
              Type a city and click &quot;Look up&quot; to set coordinates, or use current location below.
            </p>
          </div>

          <div>
            <button
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary,
              }}
            >
              {loading ? 'Getting location...' : '📍 Use Current Location'}
            </button>
          </div>

          {(lat !== null || lng !== null) && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: theme.colors.inputBg,
                border: `1px solid ${theme.colors.cardBorder}`,
              }}
            >
              <p className="text-xs mb-1" style={{ color: theme.colors.textMuted }}>
                Coordinates saved:
              </p>
              <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                {lat?.toFixed(4)}, {lng?.toFixed(4)}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${theme.colors.cardBorder}`,
                color: theme.colors.textSecondary,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (lat === null && lng === null && !city)}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary,
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
