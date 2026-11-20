import React from 'react';
import { ShieldCheck, Lock, Star, Bookmark, AlertCircle } from 'lucide-react';
import { HERO_BACKDROP_IMAGE } from '../data/stays';
import { useAuth } from '../contexts/AuthContext';

export const AuthGate: React.FC = () => {
  const { signInWithGoogle, signingIn, authError, clearAuthError } = useAuth();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col lg:flex-row">
      {/* Left Architectural Visual Panel */}
      <div className="relative lg:w-1/2 min-h-[280px] lg:min-h-screen overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-800/80 flex flex-col justify-between p-8 sm:p-12">
        <img
          src={HERO_BACKDROP_IMAGE}
          alt="Misty Himalayan ridges at golden dawn"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/75" />

        <div className="relative z-10">
          <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-stone-100">
            CloudCrest Stayz
          </span>
        </div>

        <div className="relative z-10 max-w-lg pt-16 lg:pt-0">
          <p className="text-xs font-medium tracking-wider text-amber-300 mb-3">
            Members-Only Mountain Collection
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-stone-100 leading-[1.1] text-balance">
            Register Before Entering the Sanctuaries
          </h1>
          <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed">
            Every stay across Himachal and Uttarakhand is reserved privately for registered members, safeguarding your itineraries, wishlists, and verified guest impressions.
          </p>
        </div>
      </div>

      {/* Right Google Registration Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="max-w-md w-full">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-300 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Protected by Google Identity Sign-In</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-100 tracking-tight">
            Sign in or Register
          </h2>
          <p className="mt-2 text-sm text-stone-400 leading-relaxed">
            Use your verified Google account to create your CloudCrest Stayz profile and unlock the full sanctuary collection.
          </p>

          {authError && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{authError}</p>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="mt-1.5 text-red-300 underline hover:text-red-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Primary Google Sign-In Action */}
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={signingIn}
            className="mt-7 w-full min-h-[48px] px-5 py-3 rounded-lg bg-stone-100 hover:bg-white text-stone-950 font-semibold text-sm flex items-center justify-center gap-3 transition-colors duration-150 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>
              {signingIn ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Member Benefits */}
          <div className="mt-8 pt-6 border-t border-stone-800 space-y-4">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-stone-200">
                  Private Member Bookings
                </p>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Keep track of your reserved Himalayan chalets and trip durations under your Google profile.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bookmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-stone-200">
                  Saved Sanctuary Wishlists
                </p>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Bookmark chalets and glasshouses tailored to your Google account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-stone-200">
                  Verified Guest Testimonials
                </p>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Browse and contribute attributable stay reviews inside each property’s details view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
