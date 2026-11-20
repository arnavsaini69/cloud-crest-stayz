import React, { useEffect } from 'react';
import { Calendar, MapPin, X, CheckCircle2, Ban } from 'lucide-react';
import type { PersistedBooking } from '../lib/storage';

interface MyBookingsModalProps {
  isOpen: boolean;
  bookings: PersistedBooking[];
  onClose: () => void;
  onSelectStayId: (stayId: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  bookings,
  onClose,
  onSelectStayId,
  onCancelBooking,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="My Sanctuary Reservations"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-stone-800 bg-stone-900 p-6 sm:p-7"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-stone-100">
              My Sanctuary Bookings
            </h2>
            <p className="text-xs text-stone-400 mt-0.5 tabular-nums">
              {bookings.length}{' '}
              {bookings.length === 1 ? 'reservation' : 'reservations'} linked to
              your Google account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bookings dialog"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {bookings.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-8 h-8 text-stone-600 mx-auto mb-3" />
              <p className="font-serif text-xl text-stone-200">
                No reservations yet
              </p>
              <p className="mt-1 text-sm text-stone-400">
                Select any mountain sanctuary to reserve your dates and review guest impressions.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isConfirmed = booking.status === 'confirmed';
              return (
                <div
                  key={booking.id}
                  className="rounded-lg border border-stone-800 bg-stone-950/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-400 font-medium">
                          <Ban className="w-3.5 h-3.5" />
                          Cancelled
                        </span>
                      )}
                      <span aria-hidden="true" className="text-stone-600">
                        ·
                      </span>
                      <span className="text-stone-400 tabular-nums">
                        Ref #{booking.id.slice(0, 10)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectStayId(booking.stayId);
                        onClose();
                      }}
                      className="mt-1 text-left font-serif text-xl font-semibold text-stone-100 hover:text-amber-300 transition-colors"
                    >
                      {booking.stayName}
                    </button>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-400 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {booking.stayLocation}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {booking.nights}{' '}
                        {booking.nights === 1 ? 'night' : 'nights'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {booking.guests}{' '}
                        {booking.guests === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="text-base font-semibold text-amber-300 tabular-nums">
                      &#8377;{booking.totalAmount.toLocaleString()}
                    </span>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => onCancelBooking(booking.id)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-700 text-xs font-medium text-stone-300 hover:text-red-300 hover:border-red-500/40 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
