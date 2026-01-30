'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Globe from 'react-globe.gl';
import * as d3geo from 'd3-geo';
import { getCountryColorById } from '@/lib/colors';
import { useTheme } from '@/context/ThemeContext';
import { GlobeConfig } from '@/lib/themes';

// Helper function to brighten a hex color
function brightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Helper function to add transparency to a hex color
function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface GlobeProps {
  booksByCountry: Record<string, number>;
  selectedCountry?: string;
  onCountryClick: (countryCode: string, countryName: string) => void;
}

function GlobeComponent({ booksByCountry, selectedCountry, onCountryClick }: GlobeProps) {
  const { theme } = useTheme();
  const globeConfig = theme.globe;
  const globeEl = useRef<any>();
  const [polygonsData, setPolygonsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load country polygons data using Natural Earth data
  useEffect(() => {
    setLoading(true);
    // Using Natural Earth 110m countries data
    Promise.all([
      fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(res => res.json()),
      import('topojson-client')
    ])
      .then(([topology, topojson]) => {
        // Convert TopoJSON to GeoJSON FeatureCollection (runtime returns FeatureCollection for geometry collections)
        const countries = topojson.feature(topology, topology.objects.countries) as unknown as {
          features: Array<{ id?: string; properties?: Record<string, unknown>; [key: string]: unknown }>;
        };

        // Country ID to ISO mapping (world-atlas uses numeric IDs)
        const idToIso: Record<string, string> = {
          '004': 'AF', '008': 'AL', '010': 'AQ', '012': 'DZ', '016': 'AS',
          '020': 'AD', '024': 'AO', '028': 'AG', '031': 'AZ', '032': 'AR',
          '036': 'AU', '040': 'AT', '044': 'BS', '048': 'BH', '050': 'BD',
          '051': 'AM', '052': 'BB', '056': 'BE', '060': 'BM', '064': 'BT',
          '068': 'BO', '070': 'BA', '072': 'BW', '076': 'BR', '084': 'BZ',
          '090': 'SB', '092': 'VG', '096': 'BN', '100': 'BG', '104': 'MM',
          '108': 'BI', '112': 'BY', '116': 'KH', '120': 'CM', '124': 'CA',
          '132': 'CV', '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL',
          '156': 'CN', '158': 'TW', '170': 'CO', '174': 'KM', '178': 'CG',
          '180': 'CD', '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY',
          '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM', '214': 'DO',
          '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER',
          '233': 'EE', '234': 'FO', '238': 'FK', '242': 'FJ', '246': 'FI',
          '250': 'FR', '254': 'GF', '258': 'PF', '262': 'DJ', '266': 'GA',
          '268': 'GE', '270': 'GM', '275': 'PS', '276': 'DE', '288': 'GH',
          '296': 'KI', '300': 'GR', '304': 'GL', '308': 'GD', '312': 'GP',
          '316': 'GU', '320': 'GT', '324': 'GN', '328': 'GY', '332': 'HT',
          '340': 'HN', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN',
          '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL',
          '380': 'IT', '384': 'CI', '388': 'JM', '392': 'JP', '398': 'KZ',
          '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR', '414': 'KW',
          '417': 'KG', '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV',
          '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU',
          '446': 'MO', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV',
          '466': 'ML', '470': 'MT', '474': 'MQ', '478': 'MR', '480': 'MU',
          '484': 'MX', '492': 'MC', '496': 'MN', '498': 'MD', '499': 'ME',
          '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA', '520': 'NR',
          '524': 'NP', '528': 'NL', '531': 'CW', '533': 'AW', '540': 'NC',
          '548': 'VU', '554': 'NZ', '558': 'NI', '562': 'NE', '566': 'NG',
          '570': 'NU', '574': 'NF', '578': 'NO', '580': 'MP', '583': 'FM',
          '584': 'MH', '585': 'PW', '586': 'PK', '591': 'PA', '598': 'PG',
          '600': 'PY', '604': 'PE', '608': 'PH', '612': 'PN', '616': 'PL',
          '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA',
          '638': 'RE', '642': 'RO', '643': 'RU', '646': 'RW', '652': 'BL',
          '654': 'SH', '659': 'KN', '660': 'AI', '662': 'LC', '663': 'MF',
          '666': 'PM', '670': 'VC', '674': 'SM', '678': 'ST', '682': 'SA',
          '686': 'SN', '688': 'RS', '690': 'SC', '694': 'SL', '702': 'SG',
          '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA',
          '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD', '732': 'EH',
          '740': 'SR', '744': 'SJ', '748': 'SZ', '752': 'SE', '756': 'CH',
          '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '772': 'TK',
          '776': 'TO', '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR',
          '795': 'TM', '796': 'TC', '798': 'TV', '800': 'UG', '804': 'UA',
          '807': 'MK', '818': 'EG', '826': 'GB', '831': 'GG', '832': 'JE',
          '833': 'IM', '834': 'TZ', '840': 'US', '850': 'VI', '854': 'BF',
          '858': 'UY', '860': 'UZ', '862': 'VE', '876': 'WF', '882': 'WS',
          '887': 'YE', '894': 'ZM',
        };
        
        const polygons = countries.features.map((feat: any, index: number) => {
          // Use the feature ID for color (unique per country in world-atlas)
          const featureId = feat.id || String(index);
          const countryCode = idToIso[featureId] || feat.properties?.ISO_A2 || '';
          const countryName = feat.properties?.name || feat.properties?.NAME || `Country ${featureId}`;
          const bookCount = booksByCountry[countryCode] || 0;
          
          return {
            ...feat,
            properties: {
              ...feat.properties,
              featureId,
              countryCode,
              countryName,
              bookCount,
              color: getCountryColorById(featureId),
            },
          };
        });
        setPolygonsData(polygons);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading world map data:', err);
        setLoading(false);
      });
  }, [booksByCountry]);

  // Control auto-rotation via ref after globe loads
  useEffect(() => {
    if (globeEl.current && !loading && polygonsData.length > 0) {
      // Small delay to ensure globe is fully initialized
      const timer = setTimeout(() => {
        try {
          const controls = globeEl.current?.controls();
          if (controls) {
            controls.autoRotate = !selectedCountry;
            controls.autoRotateSpeed = 1.0;
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
          }
        } catch (e) {
          console.error('Error setting controls:', e);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCountry, loading, polygonsData.length]);
  
  // Also set initial autoRotate when globe first loads
  useEffect(() => {
    if (globeEl.current && !loading && polygonsData.length > 0 && !selectedCountry) {
      const timer = setTimeout(() => {
        try {
          const controls = globeEl.current?.controls();
          if (controls && !controls.autoRotate) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.0;
          }
        } catch (e) {
          // Ignore
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, polygonsData.length, selectedCountry]);

  // State for glow ring around selected country
  const [ringData, setRingData] = useState<any[]>([]);
  const [selectedCountryColor, setSelectedCountryColor] = useState<string>('#34d399');

  // Handle zoom when country is selected
  useEffect(() => {
    if (!globeEl.current || polygonsData.length === 0) return;

    const globe = globeEl.current;

    if (selectedCountry) {
      const selectedPolygon = polygonsData.find(
        (p: any) => p.properties && p.properties.countryCode === selectedCountry
      );
      
      if (selectedPolygon && selectedPolygon.geometry) {
        try {
          const centroid = d3geo.geoCentroid(selectedPolygon.geometry);
          
          if (centroid && centroid.length === 2 && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            // d3-geo returns [lng, lat]
            const lng = centroid[0];
            const lat = centroid[1];
            
            // Get the country's original color
            const originalColor = selectedPolygon.properties.color || getCountryColorById(selectedPolygon.properties.featureId || '0');
            const brightColor = brightenColor(originalColor, 0.3);
            setSelectedCountryColor(brightColor);
            
            // Animate to the country with closer zoom
            globe.pointOfView(
              { lat, lng, altitude: 0.8 },
              1500
            );
            
            // Add multiple glow rings using the country's color mixed with theme color
            const themeRingColor = globeConfig.ringColor;
            setRingData([
              {
                lat,
                lng,
                maxR: 6,
                propagationSpeed: 3,
                repeatPeriod: 1200,
                color: brightColor,
              },
              {
                lat,
                lng,
                maxR: 10,
                propagationSpeed: 2,
                repeatPeriod: 1800,
                color: themeRingColor,
              },
            ]);
          }
        } catch (error) {
          console.error('Error calculating centroid:', error);
        }
      }
    } else {
      // Reset view when no country is selected
      globe.pointOfView(
        { lat: 20, lng: 0, altitude: 2.2 },
        1000
      );
      // Clear glow rings
      setRingData([]);
      setSelectedCountryColor('#34d399');
    }
  }, [selectedCountry, polygonsData]);

  const getPolygonColor = useCallback((polygon: any) => {
    if (!polygon || !polygon.properties) {
      return globeConfig.countryDefaultColor;
    }
    
    const props = polygon.properties;
    const countryCode = props.countryCode || '';
    const featureId = props.featureId || '0';
    const originalColor = props.color || getCountryColorById(featureId);
    
    // Highlight selected country with a brightened version of its original color
    if (selectedCountry && countryCode === selectedCountry) {
      return selectedCountryColor;
    }
    
    // Every country gets a unique color based on its feature ID
    return originalColor;
  }, [selectedCountry, selectedCountryColor, globeConfig.countryDefaultColor]);

  const getPolygonLabel = (polygon: any) => {
    if (!polygon || !polygon.properties) return '';
    const { countryName, bookCount } = polygon.properties;
    if (bookCount > 0) {
      return `${countryName}\n${bookCount} ${bookCount === 1 ? 'book' : 'books'}`;
    }
    return countryName || '';
  };

  if (loading) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ background: globeConfig.containerBg }}
      >
        <div className="text-white text-xl animate-pulse">Loading globe...</div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      style={{ background: globeConfig.containerBg }}
    >
      {/* Decorative elements for Renaissance theme */}
      {theme.id === 'renaissance' && (
        <>
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23daa520' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-4 right-4 text-6xl opacity-20 pointer-events-none">⚜️</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-20 pointer-events-none">📜</div>
        </>
      )}
      
      <Globe
        ref={globeEl}
        globeImageUrl={globeConfig.globeImageUrl}
        bumpImageUrl={globeConfig.bumpImageUrl}
        backgroundImageUrl={globeConfig.backgroundImageUrl}
        polygonsData={polygonsData}
        polygonAltitude={(polygon: any) => {
          if (!polygon || !polygon.properties) return 0.01;
          const props = polygon.properties;
          if (selectedCountry && props.countryCode === selectedCountry) {
            return 0.06; // Raise selected country more for glow effect
          }
          return 0.01; // Slight elevation for all countries to show borders
        }}
        polygonCapColor={(polygon: any) => getPolygonColor(polygon)}
        polygonSideColor={(polygon: any) => getPolygonColor(polygon)}
        polygonStrokeColor={() => globeConfig.countryBorderColor}
        polygonLabel={getPolygonLabel}
        onPolygonClick={(polygon: any) => {
          if (polygon && polygon.properties) {
            const { countryCode, countryName } = polygon.properties;
            if (countryCode) {
              onCountryClick(countryCode, countryName);
            }
          }
        }}
        onPolygonHover={(polygon: any) => {
          if (polygon) {
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
          }
        }}
        enablePointerInteraction={true}
        showGlobe={true}
        showAtmosphere={globeConfig.showAtmosphere}
        atmosphereColor={globeConfig.atmosphereColor}
        atmosphereAltitude={globeConfig.atmosphereAltitude}
        animateIn={true}
        // Glow rings for selected country
        ringsData={ringData}
        ringColor={(ring: any) => ring.color || globeConfig.ringColor}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringAltitude={0.02}
      />
    </div>
  );
}

export default memo(GlobeComponent);
