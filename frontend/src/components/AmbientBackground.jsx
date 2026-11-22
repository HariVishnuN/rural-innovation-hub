import React, { useEffect, useState } from 'react';
import { useUltraLite } from '../app/UltraLiteContext';

/**
 * AmbientBackground
 * Provides an ultra-stylish, modern technical background with:
 * 1. Subtle engineering dot/grid blueprint pattern
 * 2. Elegant animated vertical flowing lines & beams that glide downwards as the user scrolls
 * 3. Soft ambient light glow orbs (teal & sky)
 * 4. Zero performance penalty (uses GPU-accelerated transforms & pointer-events-none)
 */
const AmbientBackground = () => {
  const { ultraLite } = useUltraLite();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (ultraLite) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ultraLite]);

  if (ultraLite) {
    return null;
  }

  // Parallax offsets
  const parallaxFast = scrollY * 0.35;
  const parallaxMedium = scrollY * 0.2;
  const parallaxSlow = scrollY * 0.1;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Subtle Engineering Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)',
          backgroundSize: '36px 36px',
          transform: `translateY(${parallaxSlow % 36}px)`,
        }}
      />

      {/* 2. Soft Ambient Radial Glow Spheres */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, rgba(20, 184, 166, 0.05) 50%, transparent 70%)',
          transform: `translate3d(0, ${parallaxSlow * 0.4}px, 0)`,
        }}
      />
      <div
        className="absolute top-[40%] -right-40 w-[550px] h-[550px] rounded-full blur-[130px] opacity-35 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(59, 130, 246, 0.04) 50%, transparent 70%)',
          transform: `translate3d(0, ${-parallaxSlow * 0.3}px, 0)`,
        }}
      />
      <div
        className="absolute bottom-[-100px] left-[30%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 65%)',
          transform: `translate3d(0, ${parallaxSlow * 0.2}px, 0)`,
        }}
      />

      {/* 3. Flowing Vertical Blueprint Lines & Beams (Moving Downward on Scroll) */}
      <div className="absolute inset-0">
        {/* Stream 1 - Left Column Beam */}
        <div
          className="absolute left-[8%] w-[1.5px] h-[380px] bg-gradient-to-b from-transparent via-teal-500/35 to-transparent rounded-full blur-[0.5px] animate-pulse"
          style={{
            top: '-200px',
            transform: `translate3d(0, ${(scrollY * 0.45) % (window.innerHeight + 400)}px, 0)`,
            transition: 'transform 0.1s linear',
          }}
        />

        {/* Stream 2 - Left-Center Subtle Guide Line */}
        <div
          className="absolute left-[24%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-300/30 to-transparent"
        >
          {/* Drifting particle beam */}
          <div
            className="w-[2px] h-[180px] bg-gradient-to-b from-transparent via-teal-600/40 to-transparent rounded-full shadow-[0_0_8px_rgba(13,148,136,0.3)]"
            style={{
              transform: `translate3d(-0.5px, ${(parallaxFast + 120) % (window.innerHeight + 300)}px, 0)`,
              transition: 'transform 0.1s linear',
            }}
          />
        </div>

        {/* Stream 3 - Center Beam */}
        <div
          className="absolute left-[50%] w-[1.5px] h-[320px] bg-gradient-to-b from-transparent via-sky-500/30 to-transparent rounded-full blur-[0.5px]"
          style={{
            top: '-150px',
            transform: `translate3d(0, ${(scrollY * 0.38 + 260) % (window.innerHeight + 400)}px, 0)`,
            transition: 'transform 0.1s linear',
          }}
        />

        {/* Stream 4 - Right-Center Guide Line */}
        <div
          className="absolute left-[72%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-300/30 to-transparent"
        >
          {/* Drifting particle beam */}
          <div
            className="w-[2px] h-[220px] bg-gradient-to-b from-transparent via-teal-500/45 to-transparent rounded-full shadow-[0_0_8px_rgba(20,184,166,0.3)]"
            style={{
              transform: `translate3d(-0.5px, ${(parallaxFast + 340) % (window.innerHeight + 350)}px, 0)`,
              transition: 'transform 0.1s linear',
            }}
          />
        </div>

        {/* Stream 5 - Far Right Accent Beam */}
        <div
          className="absolute right-[8%] w-[1.5px] h-[280px] bg-gradient-to-b from-transparent via-amber-400/35 to-transparent rounded-full"
          style={{
            top: '-100px',
            transform: `translate3d(0, ${(scrollY * 0.5 + 80) % (window.innerHeight + 400)}px, 0)`,
            transition: 'transform 0.1s linear',
          }}
        />
      </div>

      {/* 4. Elegant Blueprint Decorative Crosshairs (+) */}
      <div
        className="absolute top-28 left-[15%] text-slate-400/40 font-mono text-xs select-none"
        style={{ transform: `translate3d(0, ${-parallaxSlow * 0.5}px, 0)` }}
      >
        +
      </div>
      <div
        className="absolute top-96 right-[18%] text-teal-600/30 font-mono text-xs select-none"
        style={{ transform: `translate3d(0, ${-parallaxSlow * 0.7}px, 0)` }}
      >
        +
      </div>
      <div
        className="absolute top-[680px] left-[35%] text-slate-400/30 font-mono text-xs select-none"
        style={{ transform: `translate3d(0, ${-parallaxSlow * 0.4}px, 0)` }}
      >
        +
      </div>
      <div
        className="absolute top-[1100px] right-[28%] text-sky-500/30 font-mono text-xs select-none"
        style={{ transform: `translate3d(0, ${-parallaxSlow * 0.6}px, 0)` }}
      >
        +
      </div>
    </div>
  );
};

export default AmbientBackground;
