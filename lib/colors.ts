// Predefined vibrant color palette for countries
const COUNTRY_COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#264653', '#e9c46a',
  '#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0',
  '#06d6a0', '#118ab2', '#073b4c', '#ef476f', '#ffd166',
  '#8338ec', '#3a86ff', '#fb5607', '#ff006e', '#8ac926',
  '#1982c4', '#6a4c93', '#f94144', '#f3722c', '#f8961e',
  '#90be6d', '#43aa8b', '#577590', '#277da1', '#4d908e',
  '#f9844a', '#f9c74f', '#a7c957', '#6d597a', '#b56576',
  '#e56b6f', '#eaac8b', '#355070', '#6d597a', '#b56576',
  '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#03045e',
  '#023e8a', '#0096c7', '#48cae4', '#ade8f4', '#d62828',
  '#f77f00', '#fcbf49', '#eae2b7', '#003049', '#540b0e',
  '#9e2a2b', '#e09f3e', '#fff3b0', '#335c67', '#c44536',
];

// Generate unique colors for countries based on ID
export function getCountryColorById(id: string | number): string {
  // Use the numeric ID to pick a color from the palette
  const numericId = typeof id === 'number' ? id : parseInt(id, 10) || 0;
  const colorIndex = Math.abs(numericId) % COUNTRY_COLORS.length;
  return COUNTRY_COLORS[colorIndex];
}

// Generate unique colors for countries
export function getCountryColor(countryCode: string): string {
  // Create a hash from the country code to generate consistent colors
  let hash = 0;
  for (let i = 0; i < countryCode.length; i++) {
    hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color
  const hue = Math.abs(hash) % 360;
  const saturation = 55 + (Math.abs(hash) % 25); // 55-80%
  const lightness = 45 + (Math.abs(hash) % 20); // 45-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Convert HSL to hex for Three.js
export function hslToHex(h: number, s: number, l: number): number {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return parseInt(`${f(0)}${f(8)}${f(4)}`, 16);
}

export function getCountryColorHex(countryCode: string): number {
  let hash = 0;
  for (let i = 0; i < countryCode.length; i++) {
    hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 55 + (Math.abs(hash) % 25);
  const lightness = 45 + (Math.abs(hash) % 20);
  
  return hslToHex(hue, saturation, lightness);
}

export function getCountryColorHexString(countryCode: string): string {
  const hex = getCountryColorHex(countryCode);
  return `#${hex.toString(16).padStart(6, '0')}`;
}

