/**
 * Location Service for Bookshop and Library Finder
 * 
 * Uses Google Places API (New) for nearby search and
 * real search URLs for online book options.
 */

export interface Bookshop {
  id: string;
  name: string;
  address: string;
  distance: number; // in miles
  rating?: number;
  ratingCount?: number;
  phoneNumber?: string;
  website?: string;
  placeId: string;
  lat: number;
  lng: number;
  googleMapsUri?: string;
}

export interface Library {
  id: string;
  name: string;
  address: string;
  distance: number; // in miles
  phoneNumber?: string;
  website?: string;
  placeId: string;
  lat: number;
  lng: number;
  googleMapsUri?: string;
  hasBook?: boolean;
  availabilityStatus?: 'available' | 'checked_out' | 'unknown';
}

export interface BookAvailability {
  isbn?: string;
  title: string;
  author: string;
  bookshops: Bookshop[];
  libraries: Library[];
  onlineOptions: {
    // Buy physical or e-book
    bookshopOrg?: string;
    amazonKindle?: string;
    googlePlayBooks?: string;
    kobo?: string;
    // Free / library e-books
    openLibrary?: string;
    projectGutenberg?: string;
    standardEbooks?: string;
    libbySearch?: string;
    // Discover / find in libraries
    worldCat?: string;
    goodreads?: string;
  };
}

/**
 * Find nearby bookshops using Google Places API (New)
 * https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */
export async function findNearbyBookshops(
  lat: number,
  lng: number,
  radius: number = 5000 // 5km default
): Promise<Bookshop[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri',
        },
        body: JSON.stringify({
          includedTypes: ['book_store'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Places API (New) error:', response.status, errorData);
      return [];
    }

    const data = await response.json();

    return (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      distance: calculateDistance(lat, lng, place.location?.latitude, place.location?.longitude),
      rating: place.rating,
      ratingCount: place.userRatingCount,
      website: place.websiteUri,
      placeId: place.id,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      googleMapsUri: place.googleMapsUri,
    })).sort((a: Bookshop, b: Bookshop) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching bookshops:', error);
    return [];
  }
}

/**
 * Find nearby libraries using Google Places API (New)
 */
export async function findNearbyLibraries(
  lat: number,
  lng: number,
  radius: number = 10000 // 10km default
): Promise<Library[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.websiteUri',
        },
        body: JSON.stringify({
          includedTypes: ['library'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Places API (New) error:', response.status, errorData);
      return [];
    }

    const data = await response.json();

    return (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      distance: calculateDistance(lat, lng, place.location?.latitude, place.location?.longitude),
      placeId: place.id,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      googleMapsUri: place.googleMapsUri,
      website: place.websiteUri,
      availabilityStatus: 'unknown' as const,
    })).sort((a: Library, b: Library) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    return [];
  }
}

/**
 * Get book availability information (bookshops, libraries, online options)
 */
export async function getBookAvailability(
  bookTitle: string,
  author: string,
  userLat?: number,
  userLng?: number
): Promise<BookAvailability> {
  const encodedTitle = encodeURIComponent(bookTitle);
  const encodedAuthor = encodeURIComponent(author);
  const encodedQuery = encodeURIComponent(`${bookTitle} ${author}`);

  const availability: BookAvailability = {
    title: bookTitle,
    author,
    bookshops: [],
    libraries: [],
    onlineOptions: {
      // Buy physical or e-book
      bookshopOrg: `https://bookshop.org/search?keywords=${encodedQuery}`,
      amazonKindle: `https://www.amazon.com/s?k=${encodedQuery}&i=digital-text`,
      googlePlayBooks: `https://play.google.com/store/search?q=${encodedQuery}&c=books`,
      kobo: `https://www.kobo.com/us/en/search?query=${encodedQuery}`,
      // Free / library e-books
      openLibrary: `https://openlibrary.org/search?q=${encodedQuery}`,
      projectGutenberg: `https://www.gutenberg.org/ebooks/search/?query=${encodedQuery}`,
      standardEbooks: `https://standardebooks.org/ebooks?query=${encodedQuery}`,
      libbySearch: `https://libbyapp.com/search/query-${encodedQuery}/page-1`,
      // Discover / find in libraries
      worldCat: `https://search.worldcat.org/search?q=${encodedQuery}`,
      goodreads: `https://www.goodreads.com/search?q=${encodedQuery}`,
    },
  };

  // Try to get ISBN from Google Books API for more specific links
  try {
    const booksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`"${bookTitle}" "${author}"`)}&maxResults=1`
    );
    const booksData = await booksResponse.json();
    
    if (booksData.items && booksData.items.length > 0) {
      const book = booksData.items[0];
      const isbn13 = book.volumeInfo.industryIdentifiers?.find(
        (id: any) => id.type === 'ISBN_13'
      )?.identifier;
      const isbn10 = book.volumeInfo.industryIdentifiers?.find(
        (id: any) => id.type === 'ISBN_10'
      )?.identifier;
      const isbn = isbn13 || isbn10;
      
      if (isbn) {
        availability.isbn = isbn;
        // Upgrade to ISBN-specific URLs where possible
        availability.onlineOptions.bookshopOrg = `https://bookshop.org/search?keywords=${isbn}`;
        availability.onlineOptions.openLibrary = `https://openlibrary.org/isbn/${isbn}`;
        availability.onlineOptions.amazonKindle = `https://www.amazon.com/s?k=${isbn}&i=digital-text`;
        availability.onlineOptions.worldCat = `https://search.worldcat.org/search?q=bn:${isbn}`;
      }
    }
  } catch (error) {
    console.error('Error fetching book metadata:', error);
  }

  // Find nearby locations if user location is provided
  if (userLat && userLng) {
    const [bookshops, libraries] = await Promise.all([
      findNearbyBookshops(userLat, userLng),
      findNearbyLibraries(userLat, userLng),
    ]);

    availability.bookshops = bookshops;
    availability.libraries = libraries;
  }

  return availability;
}

/**
 * Reverse geocode coordinates to a city name using Geocoding API
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const cityComponent = data.results[0].address_components.find(
        (comp: any) => comp.types.includes('locality')
      );
      return cityComponent?.long_name || null;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Forward geocode a city name to coordinates using Geocoding API
 */
export async function forwardGeocode(
  city: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Error forward geocoding:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
