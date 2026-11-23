import React from 'react';

/**
 * LoadingSkeleton
 * High-craft shimmer wave skeleton loader supporting:
 * - 'card': 3-column card grid (Showcase/Discover)
 * - 'feed': LinkedIn-style single-column wide post cards
 * - 'stats': Dashboard/Landing metric cards
 * - 'detail': Full page invention blueprint detail skeleton
 */
export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  const shimmerClass = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3 ${shimmerClass}`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100" />
            <div className="h-7 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl border border-slate-200/90 shadow-soft p-5 space-y-4 ${shimmerClass}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-5/6" />
            </div>
            <div className="w-full h-56 bg-slate-100 rounded-xl" />
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="h-4 bg-slate-100 rounded w-20" />
              <div className="h-8 bg-slate-200 rounded-xl w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default 'card' grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl border border-slate-200/90 p-4 space-y-4 shadow-soft ${shimmerClass}`}
        >
          {/* Media Header */}
          <div className="w-full h-48 bg-slate-100 rounded-xl" />

          {/* Innovator Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-1/2" />
              <div className="h-2.5 bg-slate-100 rounded w-1/3" />
            </div>
          </div>

          {/* Title & Desc */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-4/5" />
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>

          {/* Footer Stats & Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-7 bg-slate-100 rounded-lg w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
