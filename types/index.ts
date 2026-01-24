export interface Book {
  id: string;
  title: string;
  author: string;
  country?: string;       // For backwards compatibility
  countryCode: string;
  countryName?: string;   // Full country name
  startDate?: string;     // When reading started
  endDate?: string;       // When reading finished
  dateRead?: string;      // Legacy field for backwards compatibility
  rating?: number;
  notes?: string;
}

export interface CountryData {
  code: string;
  name: string;
  books: Book[];
}

