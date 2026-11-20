import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Calendar,
  Users,
  Search,
  ChevronRight,
  Heart,
  Mountain,
  LogOut,
} from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { FEATURED_STAYS, HERO_BACKDROP_IMAGE, type Stay } from './data/stays';
import { StayDetailsView } from './components/StayDetailsView';
import { AuthGate } from './components/AuthGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  MyBookingsModal,
  type PersistedBooking,
} from './components/MyBookingsModal';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

function CloudCrestAppContent() {
  const { user, authLoading, profileReady, signOutUser } = useFirebase();

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [bookings, setBookings] = useState<PersistedBooking[]>([]);
  const [bookingsModalOpen, setBookingsModalOpen] = useState<boolean>(false);
  const [activeStay, setActiveStay] = useState<Stay | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Subscribe to owner-scoped saved favorites only after auth & profile registration are ready
  useEffect(() => {
    if (!user || !profileReady) {
      setFavorites({});
      return;
    }

    const favoritesPath = `users/${user.uid}/favorites`;
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'favorites'),
      (snapshot) => {
        const nextFavs: Record<string, boolean> = {};
        snapshot.docs.forEach((docSnap) => {
          nextFavs[docSnap.id] = true;
        });
        setFavorites(nextFavs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, favoritesPath);
      }
    );

    return () => unsubscribe();
  }, [user, profileReady]);

  // Subscribe to owner-scoped bookings only after auth & profile registration are ready
  useEffect(() => {
    if (!user || !profileReady) {
      setBookings([]);
      return;
    }

    const bookingsPath = 'bookings';
    const q = query(
      collection(db, bookingsPath),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: PersistedBooking[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: String(data.userId || user.uid),
            stayId: String(data.stayId || ''),
            stayName: String(data.stayName || ''),
            stayLocation: String(data.stayLocation || ''),
            nights: Number(data.nights || 1),
            guests: Number(data.guests || 1),
            totalAmount: Number(data.totalAmount || 0),
            status: data.status === 'cancelled' ? 'cancelled' : 'confirmed',
          };
        });
        setBookings(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, bookingsPath);
      }
    );

    return () => unsubscribe();
  }, [user, profileReady]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-serif text-2xl font-semibold text-stone-100">
            CloudCrest Stayz
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Verifying member credentials...
          </p>
        </div>
      </div>
    );
  }

  // Require Google Sign-In registration before using the website
  if (!user) {
    return <AuthGate />;
  }

  const tags = [
    'All',
    'Panoramic View',
    'Fireplace',
    'Hot Tub',
    'Snow Peak Views',
    'Stargazing',
  ];

  const filteredStays = FEATURED_STAYS.filter((stay) => {
    const matchesTag = selectedTag === 'All' || stay.tags.includes(selectedTag);
    const queryText = searchDestination.trim().toLowerCase();
    const matchesSearch =
      queryText === '' ||
      stay.name.toLowerCase().includes(queryText) ||
      stay.location.toLowerCase().includes(queryText) ||
      stay.region.toLowerCase().includes(queryText);
    return matchesTag && matchesSearch;
  });

  const toggleFavorite = async (stay: Stay, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user || !profileReady) return;

    const favPath = `users/${user.uid}/favorites/${stay.id}`;
    const favRef = doc(db, 'users', user.uid, 'favorites', stay.id);
    const currentlySaved = Boolean(favorites[stay.id]);

    try {
      if (currentlySaved) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          userId: user.uid,
          stayId: stay.id,
          stayName: stay.name.slice(0, 140),
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        currentlySaved ? OperationType.DELETE : OperationType.CREATE,
        favPath
      );
    }
  };

  const handleOpenFeaturedReviews = () => {
    setActiveStay(FEATURED_STAYS[0]);
  };

  const firstName = (user.displayName || 'Member').split(' ')[0];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col">
      {/* Three-Zone Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-950/90 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveStay(null)}
            className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-stone-100 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            CloudCrest Stayz
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300"
          >
            <a
              href="#collection"
              onClick={() => setActiveStay(null)}
              className="hover:text-amber-300 hover:underline underline-offset-8 decoration-amber-400/60 transition-colors whitespace-nowrap shrink-0"
            >
              Collection
            </a>
            <a
              href="#destinations"
              onClick={() => setActiveStay(null)}
              className="hover:text-amber-300 hover:underline underline-offset-8 decoration-amber-400/60 transition-colors whitespace-nowrap shrink-0"
            >
              Destinations
            </a>
            <button
              type="button"
              onClick={handleOpenFeaturedReviews}
              className="hover:text-amber-300 hover:underline underline-offset-8 decoration-amber-400/60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Guest Reviews
            </button>
            <button
              type="button"
              onClick={() => setBookingsModalOpen(true)}
              className="hover:text-amber-300 hover:underline underline-offset-8 decoration-amber-400/60 transition-colors whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              My Bookings ({bookings.length})
            </button>
          </nav>

          {/* Zone 3: Single primary signed-in member action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => void signOutUser()}
              aria-label={`Sign out ${user.displayName || 'member'}`}
              className="min-h-[40px] px-3.5 py-2 rounded-lg border border-stone-800 bg-stone-900/80 hover:border-amber-500/40 text-stone-200 hover:text-amber-300 font-medium text-xs inline-flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span>Sign out · {firstName}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeStay ? (
          <StayDetailsView
            stay={activeStay}
            isFavorite={Boolean(favorites[activeStay.id])}
            onToggleFavorite={() => void toggleFavorite(activeStay)}
            onBack={() => setActiveStay(null)}
            onSelectStay={(stay) => setActiveStay(stay)}
            otherStays={FEATURED_STAYS.filter((s) => s.id !== activeStay.id)}
          />
        ) : (
          <>
            {/* Editorial Hero Section */}
            <section
              id="destinations"
              className="relative overflow-hidden py-16 sm:py-24 border-b border-stone-800/60"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={HERO_BACKDROP_IMAGE}
                  alt="Misty Himalayan ridges at golden dawn"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/75 to-stone-950" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-xs font-medium tracking-wider text-amber-300 mb-4">
                  Welcome, {user.displayName || 'Member'} · Himalayan High-Altitude Sanctuaries
                </p>

                <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight text-stone-100 max-w-3xl mx-auto leading-[1.08] text-balance">
                  Wake Up Above the{' '}
                  <span className="text-amber-300 italic font-medium">Clouds</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
                  Architectural timber chalets, cantilevered glass pavilions, and heritage stone cottages across quiet Himalayan ridges.
                </p>

                {/* Search Strip */}
                <div className="mt-10 max-w-4xl mx-auto bg-stone-900/95 backdrop-blur-md p-3 rounded-xl border border-stone-800">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
                    <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-stone-800">
                      <label
                        htmlFor="destination-search"
                        className="block text-xs font-medium text-stone-400"
                      >
                        Destination
                      </label>
                      <div className="mt-1 flex items-center text-sm text-stone-100">
                        <MapPin className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                        <input
                          id="destination-search"
                          type="text"
                          value={searchDestination}
                          onChange={(e) => setSearchDestination(e.target.value)}
                          placeholder="Manali, Shimla, Mussoorie..."
                          className="w-full bg-transparent focus:outline-none placeholder:text-stone-500 text-stone-100"
                        />
                      </div>
                    </div>

                    <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-stone-800">
                      <div className="text-xs font-medium text-stone-400">Dates</div>
                      <div className="mt-1 flex items-center text-sm text-stone-200">
                        <Calendar className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                        <span className="tabular-nums">Nov 10 – Nov 15</span>
                      </div>
                    </div>

                    <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-stone-800">
                      <div className="text-xs font-medium text-stone-400">Guests</div>
                      <div className="mt-1 flex items-center text-sm text-stone-200">
                        <Users className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                        <span>2 Guests, 1 Cabin</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <a
                        href="#collection"
                        className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors duration-150 whitespace-nowrap"
                      >
                        <Search className="w-4 h-4" />
                        <span>Explore Stays</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Curated Collection Grid */}
            <section
              id="collection"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-stone-100 tracking-tight">
                    Featured Mountain Sanctuaries
                  </h2>
                  <p className="mt-1 text-sm text-stone-400 tabular-nums">
                    {filteredStays.length}{' '}
                    {filteredStays.length === 1 ? 'sanctuary' : 'sanctuaries'} available · Select any stay to view details and verified guest reviews
                  </p>
                </div>

                {/* Interactive Filter Tabs */}
                <div
                  role="tablist"
                  aria-label="Filter sanctuaries by highlight"
                  className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-stone-900 border border-stone-800"
                >
                  {tags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setSelectedTag(tag)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 font-semibold'
                            : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredStays.length === 0 ? (
                <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-12 text-center">
                  <p className="font-serif text-2xl text-stone-200">
                    No sanctuaries match that filter
                  </p>
                  <p className="mt-2 text-sm text-stone-400">
                    Try clearing your destination search or switching to all highlights.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag('All');
                      setSearchDestination('');
                    }}
                    className="mt-5 min-h-[40px] px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredStays.map((stay) => (
                    <article
                      key={stay.id}
                      onClick={() => setActiveStay(stay)}
                      className="group cursor-pointer rounded-xl bg-stone-900/50 border border-stone-800 hover:border-amber-500/40 transition-all duration-200 overflow-hidden flex flex-col hover:-translate-y-0.5"
                    >
                      {/* Property Photography */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-900">
                        {failedImages[stay.id] ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-stone-950 p-6 text-center">
                            <Mountain className="w-8 h-8 text-amber-400/70 mb-2" />
                            <span className="font-serif text-lg text-stone-200">{stay.name}</span>
                          </div>
                        ) : (
                          <img
                            src={stay.image}
                            alt={`${stay.name} in ${stay.location}`}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [stay.id]: true }))
                            }
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />

                        <button
                          type="button"
                          onClick={(e) => void toggleFavorite(stay, e)}
                          aria-label={
                            favorites[stay.id]
                              ? `Remove ${stay.name} from saved stays`
                              : `Save ${stay.name} to wishlist`
                          }
                          className="absolute top-3 right-3 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-stone-950/75 backdrop-blur-sm border border-stone-700/60 text-stone-200 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites[stay.id] ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </button>

                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-stone-200 tabular-nums">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {stay.rating.toFixed(2)}
                            <span className="text-stone-300 font-normal ml-0.5">
                              ({stay.reviewsCount} reviews)
                            </span>
                          </span>
                          <span className="text-stone-200 font-medium">{stay.elevation}</span>
                        </div>
                      </div>

                      {/* Card Body: Clean Unboxed Metadata */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs text-stone-400">
                            {stay.location} <span aria-hidden="true">·</span> {stay.capacity}
                          </div>
                          <h3 className="mt-1.5 font-serif text-xl font-semibold text-stone-100 group-hover:text-amber-300 transition-colors">
                            {stay.name}
                          </h3>
                          <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                            {stay.tags.join(' · ')}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between">
                          <div className="tabular-nums">
                            <span className="text-base font-semibold text-amber-300">
                              &#8377;{stay.pricePerNight.toLocaleString()}
                            </span>
                            <span className="text-xs text-stone-400"> / night</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStay(stay);
                            }}
                            className="inline-flex items-center min-h-[36px] px-2 -mr-2 rounded text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:translate-x-0.5 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          >
                            Stay details &amp; reviews
                            <ChevronRight className="w-4 h-4 ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Concierge Assurance Section */}
            <section
              id="concierge"
              className="border-t border-stone-800/70 bg-stone-900/25 py-14"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-stone-100">
                      Thermal &amp; Altitude Readiness
                    </h3>
                    <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                      Every residence is inspected seasonally for hydronic heating, insulated glazing, and uninterrupted backup power.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-stone-100">
                      Owner-Secured Reservations
                    </h3>
                    <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                      Bookings, saved wishlists, and member profiles are isolated per Google UID through strict Firestore security rules.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-stone-100">
                      Verified Stay Reviews
                    </h3>
                    <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                      Every testimonial inside our sanctuary pages is published exclusively by authenticated members.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <MyBookingsModal
        isOpen={bookingsModalOpen}
        bookings={bookings}
        onClose={() => setBookingsModalOpen(false)}
        onSelectStayId={(stayId) => {
          const found = FEATURED_STAYS.find((s) => s.id === stayId);
          if (found) setActiveStay(found);
        }}
      />

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-stone-800/70 bg-stone-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span>CloudCrest Stayz · Curated Himalayan Sanctuaries</span>
          <span>
            &copy; {new Date().getFullYear()} CloudCrest Stayz. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <CloudCrestAppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
