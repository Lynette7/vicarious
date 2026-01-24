import { Book, CountryData } from '@/types';

const STORAGE_KEY = 'around-the-world-books';

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function addBook(book: Book): void {
  const books = getBooks();
  books.push(book);
  saveBooks(books);
}

export function updateBook(id: string, updates: Partial<Book>): void {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...updates };
    saveBooks(books);
  }
}

export function deleteBook(id: string): void {
  const books = getBooks();
  const filtered = books.filter(b => b.id !== id);
  saveBooks(filtered);
}

export function getBooksByCountry(): Record<string, Book[]> {
  const books = getBooks();
  const grouped: Record<string, Book[]> = {};
  
  books.forEach(book => {
    if (!grouped[book.countryCode]) {
      grouped[book.countryCode] = [];
    }
    grouped[book.countryCode].push(book);
  });
  
  return grouped;
}

export function getCountryData(): CountryData[] {
  const booksByCountry = getBooksByCountry();
  return Object.entries(booksByCountry).map(([code, books]) => ({
    code,
    name: books[0]?.country || code,
    books,
  }));
}


