import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-soft">
          <div className="w-full h-44 bg-slate-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
