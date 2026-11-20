import type { GuestReview } from '../data/stays';

export interface PersistedBooking {
  id: string;
  userId: string;
  stayId: string;
  stayName: string;
  stayLocation: string;
  nights: number;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

const favoritesKey = (uid: string) => `cloudcrest_favorites_${uid}`;
const bookingsKey = (uid: string) => `cloudcrest_bookings_${uid}`;
const reviewsKey = (stayId: string) => `cloudcrest_reviews_${stayId}`;

export function loadFavorites(uid: string): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(favoritesKey(uid));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function saveFavorites(uid: string, favorites: Record<string, boolean>): void {
  try {
    window.localStorage.setItem(favoritesKey(uid), JSON.stringify(favorites));
  } catch {
    // Ignore storage errors
  }
}

export function loadBookings(uid: string): PersistedBooking[] {
  try {
    const raw = window.localStorage.getItem(bookingsKey(uid));
    if (!raw) return [];
    return JSON.parse(raw) as PersistedBooking[];
  } catch {
    return [];
  }
}

export function saveBookings(uid: string, bookings: PersistedBooking[]): void {
  try {
    window.localStorage.setItem(bookingsKey(uid), JSON.stringify(bookings));
  } catch {
    // Ignore storage errors
  }
}

export function loadStayReviews(stayId: string): GuestReview[] {
  try {
    const raw = window.localStorage.getItem(reviewsKey(stayId));
    if (!raw) return [];
    return JSON.parse(raw) as GuestReview[];
  } catch {
    return [];
  }
}

export function saveStayReview(stayId: string, review: GuestReview): GuestReview[] {
  const existing = loadStayReviews(stayId);
  const updated = [review, ...existing];
  try {
    window.localStorage.setItem(reviewsKey(stayId), JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
  return updated;
}
