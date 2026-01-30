/**
 * Location Service for Bookshop and Library Finder
 * 
 * Handles finding nearby bookshops and libraries using Google Places API
 * and checking book availability via Open Library and WorldCat.
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
  hasBook?: boolean; // Whether the library has the book (from WorldCat/Open Library)
  availabilityStatus?: 'available' | 'checked_out' | 'unknown';
}

export interface BookAvailability {
  isbn?: string;
  title: string;
  author: string;
  bookshops: Bookshop[];
  libraries: Library[];
  onlineOptions: {
    bookshopOrg?: string;
    libby?: string;
    openLibrary?: string;
  };
}

/**
 * Find nearby bookshops using Google Places API
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
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${lat},${lng}&` +
      `radius=${radius}&` +
      `type=book_store&` +
      `key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }

    return (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || '',
      distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
      rating: place.rating,
      ratingCount: place.user_ratings_total,
      placeId: place.place_id,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    })).sort((a: Bookshop, b: Bookshop) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching bookshops:', error);
    return [];
  }
}

/**
 * Find nearby libraries using Google Places API
 */
export async function findNearbyLibraries(
  lat: number,
  lng: number,
  radius: number = 10000 // 10km default (libraries are less common)
): Promise<Library[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${lat},${lng}&` +
      `radius=${radius}&` +
      `type=library&` +
      `key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }

    return (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || '',
      distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
      placeId: place.place_id,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      availabilityStatus: 'unknown' as const,
    })).sort((a: Library, b: Library) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    return [];
  }
}

/**
 * Check if a library has a specific book (using Open Library API)
 */
export async function checkLibraryAvailability(
  library: Library,
  bookTitle: string,
  author: string
): Promise<boolean> {
  // Open Library API doesn't have real-time availability per library
  // This is a simplified check - in production, you'd use WorldCat API
  // which requires an API key and provides library-specific holdings
  
  try {
    // Search Open Library for the book
    const searchResponse = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}&author=${encodeURIComponent(author)}&limit=1`
    );
    
    const searchData = await searchResponse.json();
    
    if (searchData.docs && searchData.docs.length > 0) {
      // Book exists in Open Library (but doesn't mean this library has it)
      // In production, use WorldCat API: https://www.worldcat.org/wcapi/
      return true; // Optimistic return
    }
    
    return false;
  } catch (error) {
    console.error('Error checking library availability:', error);
    return false;
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
  const availability: BookAvailability = {
    title: bookTitle,
    author,
    bookshops: [],
    libraries: [],
    onlineOptions: {},
  };

  // Get ISBN from Google Books API
  try {
    const booksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`"${bookTitle}" "${author}"`)}&maxResults=1`
    );
    const booksData = await booksResponse.json();
    
    if (booksData.items && booksData.items.length > 0) {
      const book = booksData.items[0];
      const isbn = book.volumeInfo.industryIdentifiers?.find(
        (id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier;
      
      if (isbn) {
        availability.isbn = isbn;
        // Build online options
        availability.onlineOptions.bookshopOrg = `https://bookshop.org/books/${isbn}`;
        availability.onlineOptions.openLibrary = `https://openlibrary.org/isbn/${isbn}`;
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

    // Check library availability (simplified - would use WorldCat in production)
    // For now, we'll mark all as unknown
    availability.libraries = availability.libraries.map(lib => ({
      ...lib,
      availabilityStatus: 'unknown' as const,
    }));
  }

  return availability;
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
