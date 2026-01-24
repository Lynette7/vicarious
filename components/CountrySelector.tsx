'use client';

import { COUNTRIES, getCountryCode, getCountryName } from '@/lib/countries';

interface CountrySelectorProps {
  selectedCountry?: string;
  onCountrySelect: (countryCode: string, countryName: string) => void;
  booksCountByCountry: Record<string, number>;
}

export default function CountrySelector({
  selectedCountry,
  onCountrySelect,
  booksCountByCountry,
}: CountrySelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value;
    if (countryName) {
      const code = getCountryCode(countryName);
      onCountrySelect(code, countryName);
    }
  };

  // Find the country name for the selected country code
  const selectedCountryName = selectedCountry ? getCountryName(selectedCountry) : '';

  return (
    <select
      value={selectedCountryName}
      onChange={handleChange}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select a country...</option>
      {COUNTRIES.map((country) => {
        const code = getCountryCode(country);
        const count = booksCountByCountry[code] || 0;
        return (
          <option key={country} value={country}>
            {country} {count > 0 ? `(${count})` : ''}
          </option>
        );
      })}
    </select>
  );
}

