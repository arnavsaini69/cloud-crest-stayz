import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  MapPin,
  Minus,
  Plus,
  Mountain,
  Star,
  PenLine,
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { GuestReview, Stay } from '../data/stays';
import { TestimonialsCarousel } from './TestimonialsCarousel';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface StayDetailsViewProps {
  stay: Stay;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
  onSelectStay: (stay: Stay) => void;
  otherStays: Stay[];
}

export const StayDetailsView: React.FC<StayDetailsViewProps> = ({
  stay,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectStay,
  otherStays,
}) => {
  const { user, profileReady } = useFirebase();
  const [nights, setNights] = useState<number>(3);
  const [guests, setGuests] = useState<number>(Math.min(2, stay.maxGuests));
  const [bookingConfirmedId, setBookingConfirmedId] = useState<string | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Live Firestore reviews for this individual stay
  const [firestoreReviews, setFirestoreReviews] = useState<GuestReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewNights, setReviewNights] = useState<number>(3);
  const [reviewCity, setReviewCity] = useState<string>('');
  const [reviewRole, setReviewRole] = useState<string>('');
  const [reviewHighlight, setReviewHighlight] = useState<string>('');
  const [reviewQuote, setReviewQuote] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Reset form state when switching stays
  useEffect(() => {
    setNights(3);
    setGuests(Math.min(2, stay.maxGuests));
    setBookingConfirmedId(null);
    setImageError(false);
    setShowReviewForm(false);
    setReviewError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stay.id, stay.maxGuests]);

  // Subscribe to published Firestore reviews for this stay when authenticated
  useEffect(() => {
    if (!user || !profileReady) {
      setFirestoreReviews([]);
      return;
    }

    const reviewsPath = 'stayReviews';
    const q = query(
      collection(db, reviewsPath),
      where('stayId', '==', stay.id),
      where('isPublished', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: GuestReview[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            guestName: String(data.guestName || 'CloudCrest Member'),
            guestInitials: String(data.guestInitials || 'CM'),
            guestRole: String(data.guestRole || 'Member'),
            guestCity: String(data.guestCity || 'India'),
            stayDate: String(data.stayDate || 'November 2026'),
            nightsStayed: Number(data.nightsStayed || 2),
            rating: Number(data.rating || 5),
            highlight: String(data.highlight || 'Verified Member Stay'),
            quote: String(data.quote || ''),
            verifiedStay: true,
          };
        });
        setFirestoreReviews(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, reviewsPath);
      }
    );

    return () => unsubscribe();
  }, [stay.id, user, profileReady]);

  // Allow Escape key to return to collection
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  const staySubtotal = stay.pricePerNight * nights;
  const conciergeFee = Math.round(staySubtotal * 0.08);
  const totalAmount = staySubtotal + conciergeFee;

  const handleConfirmBooking = async () => {
    if (!user || !profileReady || submittingBooking) return;
    setSubmittingBooking(true);
    const bookingId = `bk_${stay.id}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    const path = `bookings/${bookingId}`;

    try {
      await setDoc(doc(db, 'bookings', bookingId), {
        userId: user.uid,
        stayId: stay.id,
        stayName: stay.name.slice(0, 140),
        stayLocation: stay.location.slice(0, 140),
        nights: Math.min(14, Math.max(1, Math.round(nights))),
        guests: Math.min(8, Math.max(1, Math.round(guests))),
        totalAmount,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setBookingConfirmedId(bookingId);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileReady || submittingReview) return;

    const trimmedRole = reviewRole.trim().slice(0, 80);
    const trimmedCity = reviewCity.trim().slice(0, 80);
    const trimmedHighlight = reviewHighlight.trim().slice(0, 120);
    const trimmedQuote = reviewQuote.trim().slice(0, 1000);

    if (trimmedRole.length < 2 || trimmedCity.length < 2) {
      setReviewError('Please enter your city and travel role (at least 2 characters).');
      return;
    }
    if (trimmedHighlight.length < 3) {
      setReviewError('Please summarize your stay highlight (at least 3 characters).');
      return;
    }
    if (trimmedQuote.length < 12) {
      setReviewError('Please share at least 12 characters describing your experience.');
      return;
    }

    setReviewError(null);
    setSubmittingReview(true);

    const safeName = (user.displayName || 'CloudCrest Member').trim().slice(0, 80);
    const initials = safeName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'CM';

    const reviewId = `rev_${stay.id}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    const path = `stayReviews/${reviewId}`;

    const monthYear = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    try {
      await setDoc(doc(db, 'stayReviews', reviewId), {
        stayId: stay.id,
        authorUid: user.uid,
        guestName: safeName,
        guestInitials: initials.slice(0, 4),
        guestRole: trimmedRole,
        guestCity: trimmedCity,
        stayDate: monthYear.slice(0, 40),
        nightsStayed: Math.min(30, Math.max(1, Math.round(reviewNights))),
        rating: Math.min(5, Math.max(1, Number(reviewRating))),
        highlight: trimmedHighlight,
        quote: trimmedQuote,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setReviewCity('');
      setReviewRole('');
      setReviewHighlight('');
      setReviewQuote('');
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setSubmittingReview(false);
    }
  };

  const combinedReviews = [...firestoreReviews, ...stay.reviews];
  const combinedTotalCount = stay.reviewsCount + firestoreReviews.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 min-h-[40px] px-3 py-2 -ml-3 rounded-lg text-sm font-medium text-stone-300 hover:text-amber-300 hover:bg-stone-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all sanctuaries</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onToggleFavorite(stay.id)}
            aria-label={isFavorite ? 'Remove stay from wishlist' : 'Save stay to wishlist'}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-stone-800 bg-stone-900/60 text-xs font-medium text-stone-200 hover:border-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'
              }`}
            />
            <span>{isFavorite ? 'Saved' : 'Save stay'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Stay Details Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Architectural Gallery, Overview, Amenities & Testimonials Carousel */}
        <div className="lg:col-span-7 space-y-8">
          {/* Primary Property Photo */}
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-stone-800 bg-stone-900">
            {imageError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-8 text-center">
                <Mountain className="w-10 h-10 text-amber-400/70 mb-3" />
                <p className="font-serif text-xl text-stone-200">{stay.name}</p>
                <p className="text-xs text-stone-400 mt-1">{stay.location}</p>
              </div>
            ) : (
              <img
                src={stay.image}
                alt={`${stay.name} in ${stay.location}`}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Stay Identity & Unboxed Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {stay.location}
              </span>
              <span aria-hidden="true">·</span>
              <span>{stay.region}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{stay.elevation} Elevation</span>
            </div>

            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-stone-100 tracking-tight text-balance">
              {stay.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-300 tabular-nums">
              <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {stay.rating.toFixed(2)}
              </span>
              <span className="text-stone-400">({combinedTotalCount} guest reviews)</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>{stay.capacity}</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>{stay.beds}</span>
            </div>

            <p className="mt-5 text-[15px] sm:text-base text-stone-300 leading-relaxed max-w-[68ch]">
              {stay.description}
            </p>
          </div>

          {/* Key Sanctuary Provisions */}
          <div className="border-t border-stone-800 pt-8">
            <h2 className="font-serif text-2xl font-semibold text-stone-100">
              Architectural &amp; Stay Provisions
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {stay.amenities.map((item) => (
                <div
                  key={item}
                  className="py-2.5 border-b border-stone-800/70 text-sm text-stone-300 flex items-center justify-between"
                >
                  <span>{item}</span>
                  <span className="text-xs text-amber-400/90 font-medium">Included</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-400">
              <span className="text-stone-500">Highlights:</span>
              {stay.tags.map((tag, idx) => (
                <React.Fragment key={tag}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span className="text-stone-300">{tag}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Testimonials Carousel Component for This Individual Stay */}
          <TestimonialsCarousel
            stayName={stay.name}
            rating={stay.rating}
            reviewsCount={combinedTotalCount}
            ratingBreakdown={stay.ratingBreakdown}
            reviews={combinedReviews}
          />

          {/* Member Review Composer */}
          <div className="pt-2">
            {!showReviewForm ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-stone-800 bg-stone-900/60 hover:border-amber-500/40 text-xs font-medium text-stone-200 hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Share a verified review for {stay.name}</span>
              </button>
            ) : (
              <form
                onSubmit={(e) => void handleReviewSubmit(e)}
                className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold text-stone-100">
                    Write a Guest Impression
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewError(null);
                    }}
                    className="text-xs text-stone-400 hover:text-stone-200"
                  >
                    Cancel
                  </button>
                </div>

                {reviewError && (
                  <p role="alert" className="text-xs text-red-300">
                    {reviewError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="rev-rating" className="block text-xs text-stone-400 mb-1">
                      Rating (1–5)
                    </label>
                    <select
                      id="rev-rating"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full min-h-[40px] px-3 rounded-lg border border-stone-800 bg-stone-950 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value={5}>5.0 — Exceptional</option>
                      <option value={4.9}>4.9 — Remarkable</option>
                      <option value={4.5}>4.5 — Memorable</option>
                      <option value={4}>4.0 — Very Good</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rev-nights" className="block text-xs text-stone-400 mb-1">
                      Nights Stayed
                    </label>
                    <input
                      id="rev-nights"
                      type="number"
                      min={1}
                      max={30}
                      value={reviewNights}
                      onChange={(e) => setReviewNights(Number(e.target.value))}
                      className="w-full min-h-[40px] px-3 rounded-lg border border-stone-800 bg-stone-950 text-sm text-stone-100 tabular-nums focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="rev-city" className="block text-xs text-stone-400 mb-1">
                      Origin City
                    </label>
                    <input
                      id="rev-city"
                      type="text"
                      maxLength={80}
                      value={reviewCity}
                      onChange={(e) => setReviewCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full min-h-[40px] px-3 rounded-lg border border-stone-800 bg-stone-950 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rev-role" className="block text-xs text-stone-400 mb-1">
                      Profession / Travel Context
                    </label>
                    <input
                      id="rev-role"
                      type="text"
                      maxLength={80}
                      value={reviewRole}
                      onChange={(e) => setReviewRole(e.target.value)}
                      placeholder="e.g. Architect · Autumn Retreat"
                      className="w-full min-h-[40px] px-3 rounded-lg border border-stone-800 bg-stone-950 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="rev-highlight" className="block text-xs text-stone-400 mb-1">
                      Stay Highlight
                    </label>
                    <input
                      id="rev-highlight"
                      type="text"
                      maxLength={120}
                      value={reviewHighlight}
                      onChange={(e) => setReviewHighlight(e.target.value)}
                      placeholder="e.g. Dawn mist from the timber deck"
                      className="w-full min-h-[40px] px-3 rounded-lg border border-stone-800 bg-stone-950 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rev-quote" className="block text-xs text-stone-400 mb-1">
                    Your Experience
                  </label>
                  <textarea
                    id="rev-quote"
                    rows={3}
                    maxLength={1000}
                    value={reviewQuote}
                    onChange={(e) => setReviewQuote(e.target.value)}
                    placeholder="Share how the space, quiet, and local hospitality shaped your stay..."
                    className="w-full p-3 rounded-lg border border-stone-800 bg-stone-950 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="min-h-[40px] px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    {submittingReview ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Sticky Booking Module */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-6 sm:p-7">
            {bookingConfirmedId ? (
              <div className="py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-emerald-400">
                  Reservation #{bookingConfirmedId.slice(0, 12)} Saved
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-100">
                  {stay.name}
                </h2>
                <p className="mt-2 text-sm text-stone-400">
                  {nights} nights for {guests} {guests === 1 ? 'guest' : 'guests'} · Total ₹{totalAmount.toLocaleString()}
                </p>
                <p className="mt-4 text-xs text-stone-400 leading-relaxed">
                  Secured to your member profile in Firestore. Open My Bookings anytime to review or modify your itinerary.
                </p>
                <button
                  type="button"
                  onClick={() => setBookingConfirmedId(null)}
                  className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-lg border border-stone-700 text-sm font-medium text-stone-200 hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Book Another Stay
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between pb-5 border-b border-stone-800">
                  <div>
                    <span className="font-serif text-3xl font-semibold text-amber-300 tabular-nums">
                      &#8377;{stay.pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400 ml-1">/ night</span>
                  </div>
                  <div className="text-xs text-stone-300 tabular-nums flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{stay.rating.toFixed(2)}</span>
                    <span className="text-stone-500">({combinedTotalCount})</span>
                  </div>
                </div>

                {/* Stay Configuration Steppers */}
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-stone-800/70">
                    <div>
                      <div className="text-sm font-medium text-stone-200">Duration</div>
                      <div className="text-xs text-stone-400 tabular-nums">
                        {nights} {nights === 1 ? 'night' : 'nights'} · Flexible check-in
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNights((n) => Math.max(1, n - 1))}
                        disabled={nights <= 1}
                        aria-label="Decrease nights"
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-stone-100 tabular-nums">
                        {nights}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNights((n) => Math.min(14, n + 1))}
                        disabled={nights >= 14}
                        aria-label="Increase nights"
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-stone-800/70">
                    <div>
                      <div className="text-sm font-medium text-stone-200">Guests</div>
                      <div className="text-xs text-stone-400 tabular-nums">
                        Up to {stay.maxGuests} guests
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        disabled={guests <= 1}
                        aria-label="Decrease guests"
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-stone-100 tabular-nums">
                        {guests}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.min(stay.maxGuests, g + 1))}
                        disabled={guests >= stay.maxGuests}
                        aria-label="Increase guests"
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-stone-300">
                    <span className="tabular-nums">
                      &#8377;{stay.pricePerNight.toLocaleString()} &times; {nights}{' '}
                      {nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="tabular-nums">&#8377;{staySubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Himalayan concierge &amp; breakfast</span>
                    <span className="tabular-nums">&#8377;{conciergeFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between font-semibold text-stone-100">
                    <span>Total Estimate</span>
                    <span className="text-lg text-amber-300 tabular-nums">
                      &#8377;{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submittingBooking || !profileReady}
                  onClick={() => void handleConfirmBooking()}
                  className="mt-6 w-full min-h-[44px] py-3 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm transition-colors duration-150 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 whitespace-nowrap"
                >
                  {submittingBooking ? 'Securing Reservation...' : 'Reserve Sanctuary'}
                </button>
                <p className="mt-3 text-center text-xs text-stone-400">
                  Free cancellation up to 7 days prior to arrival
                </p>
              </>
            )}
          </div>

          {/* Switch to Another Sanctuary */}
          {otherStays.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-800/80">
              <p className="text-xs font-medium text-stone-400 mb-3">
                Compare reviews across other sanctuaries
              </p>
              <div className="space-y-2">
                {otherStays.slice(0, 3).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => onSelectStay(candidate)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg border border-stone-800/80 bg-stone-900/40 hover:border-amber-500/40 hover:bg-stone-900 transition-colors flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-stone-200 truncate">
                        {candidate.name}
                      </div>
                      <div className="text-xs text-stone-400 truncate">
                        {candidate.location} · {candidate.reviews.length} featured reviews
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-300 tabular-nums shrink-0">
                      {candidate.rating.toFixed(2)} ★
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
