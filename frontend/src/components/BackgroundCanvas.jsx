import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useUltraLite } from '../app/UltraLiteContext';

/**
 * BackgroundCanvas
 * High-tech engineering blueprint canvas featuring:
 * 1. Multiple vertical parallel tracks spanning across the screen.
 * 2. Continuously streaming parallel dashed laser lines moving downwards on scroll.
 * 3. Descending luminescent energy capsules with radiant cyan/teal glow heads that glide downwards parallelly.
 * 4. Faint engineering blueprint dot-grid & ambient atmospheric lighting.
 * 5. Completely disabled in Ultra-Lite mode for zero overhead.
 */
const BackgroundCanvas = () => {
  const { ultraLite } = useUltraLite();
  const { scrollY, scrollYProgress } = useScroll();

  // Smooth springs for buttery 60fps tracking
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Continuous stroke dash offsets - decreases as scrollY increases so dashes continuously flow DOWN
  const dashStreamLeft1 = useTransform(scrollY, (y) => -y * 1.8);
  const dashStreamLeft2 = useTransform(scrollY, (y) => -y * 1.4);
  const dashStreamLeft3 = useTransform(scrollY, (y) => -y * 2.1);
  const dashStreamRight1 = useTransform(scrollY, (y) => -y * 1.9);
  const dashStreamRight2 = useTransform(scrollY, (y) => -y * 1.5);
  const dashStreamRight3 = useTransform(scrollY, (y) => -y * 2.2);

  // Parallel beam positions descending down tracks (two staggered capsules per track for zero gaps)
  // Left Track 1 (Far Left: ~3.5%)
  const l1_capA = useTransform(scrollY, (y) => ((y * 1.25) % 1100) - 260);
  const l1_capB = useTransform(scrollY, (y) => (((y * 1.25) + 550) % 1100) - 260);

  // Left Track 2 (Mid Left: ~7.5%)
  const l2_capA = useTransform(scrollY, (y) => ((y * 1.55) % 1200) - 300);
  const l2_capB = useTransform(scrollY, (y) => (((y * 1.55) + 600) % 1200) - 300);

  // Left Track 3 (Inner Left: ~13.5%)
  const l3_capA = useTransform(scrollY, (y) => ((y * 0.95) % 1000) - 240);
  const l3_capB = useTransform(scrollY, (y) => (((y * 0.95) + 500) % 1000) - 240);

  // Right Track 1 (Inner Right: ~86.5%)
  const r1_capA = useTransform(scrollY, (y) => ((y * 1.05) % 1050) - 250);
  const r1_capB = useTransform(scrollY, (y) => (((y * 1.05) + 525) % 1050) - 250);

  // Right Track 2 (Mid Right: ~92.5%)
  const r2_capA = useTransform(scrollY, (y) => ((y * 1.45) % 1150) - 280);
  const r2_capB = useTransform(scrollY, (y) => (((y * 1.45) + 575) % 1150) - 280);

  // Right Track 3 (Far Right: ~96.5%)
  const r3_capA = useTransform(scrollY, (y) => ((y * 1.3) % 1100) - 260);
  const r3_capB = useTransform(scrollY, (y) => (((y * 1.3) + 550) % 1100) - 260);

  if (ultraLite) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* 1. Engineering Dot-Grid Matrix */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #94A3B8 1.1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Soft Ambient Radial Glow Orbs */}
      <div
        className="absolute -top-32 -left-32 w-[540px] h-[540px] rounded-full blur-[130px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.35) 0%, rgba(20, 184, 166, 0.08) 60%, transparent 80%)',
        }}
      />
      <div
        className="absolute top-[35%] -right-32 w-[520px] h-[520px] rounded-full blur-[130px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(59, 130, 246, 0.06) 60%, transparent 80%)',
        }}
      />
      <div
        className="absolute bottom-[-80px] left-[25%] w-[480px] h-[480px] rounded-full blur-[120px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* ============================================================== */}
      {/* 3. PARALLEL VERTICAL TRACKS WITH DOWNWARD STREAMING LINES      */}
      {/* ============================================================== */}

      {/* LEFT SIDE: 3 PARALLEL GUIDE TRACKS */}
      {/* Left Track 1: Far Left (3.5%) */}
      <div className="absolute left-[2.5%] sm:left-[3.5%] top-0 bottom-0 w-[2px]">
        {/* Continuous Streaming Dashed SVG Line */}
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(13, 148, 136, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="6 14"
            style={{ strokeDashoffset: dashStreamLeft1 }}
          />
        </svg>
        {/* Capsule A */}
        <motion.div
          style={{ y: l1_capA }}
          className="w-[2px] h-48 bg-gradient-to-b from-transparent via-teal-500 to-transparent rounded-full shadow-[0_0_12px_rgba(13,148,136,0.6)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] -mb-1" />
        </motion.div>
        {/* Capsule B */}
        <motion.div
          style={{ y: l1_capB }}
          className="w-[2px] h-48 bg-gradient-to-b from-transparent via-teal-500 to-transparent rounded-full shadow-[0_0_12px_rgba(13,148,136,0.6)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] -mb-1" />
        </motion.div>
      </div>

      {/* Left Track 2: Mid Left (7.5%) */}
      <div className="absolute left-[6.5%] sm:left-[7.5%] top-0 bottom-0 w-[2px] hidden sm:block">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(14, 165, 233, 0.28)"
            strokeWidth="1.5"
            strokeDasharray="8 16"
            style={{ strokeDashoffset: dashStreamLeft2 }}
          />
        </svg>
        <motion.div
          style={{ y: l2_capA }}
          className="w-[2px] h-56 bg-gradient-to-b from-transparent via-sky-500 to-transparent rounded-full shadow-[0_0_12px_rgba(14,165,233,0.55)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8] -mb-1" />
        </motion.div>
        <motion.div
          style={{ y: l2_capB }}
          className="w-[2px] h-56 bg-gradient-to-b from-transparent via-sky-500 to-transparent rounded-full shadow-[0_0_12px_rgba(14,165,233,0.55)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8] -mb-1" />
        </motion.div>
      </div>

      {/* Left Track 3: Inner Left (13.5%) */}
      <div className="absolute left-[12%] sm:left-[13.5%] top-0 bottom-0 w-[2px] hidden md:block">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(37, 99, 235, 0.24)"
            strokeWidth="1.5"
            strokeDasharray="10 18"
            style={{ strokeDashoffset: dashStreamLeft3 }}
          />
        </svg>
        <motion.div
          style={{ y: l3_capA }}
          className="w-[2px] h-44 bg-gradient-to-b from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] flex flex-col justify-end items-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#60a5fa] -mb-0.5" />
        </motion.div>
        <motion.div
          style={{ y: l3_capB }}
          className="w-[2px] h-44 bg-gradient-to-b from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] flex flex-col justify-end items-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#60a5fa] -mb-0.5" />
        </motion.div>
      </div>

      {/* RIGHT SIDE: 3 PARALLEL GUIDE TRACKS */}
      {/* Right Track 1: Inner Right (86.5%) */}
      <div className="absolute right-[12%] sm:right-[13.5%] top-0 bottom-0 w-[2px] hidden md:block">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(37, 99, 235, 0.24)"
            strokeWidth="1.5"
            strokeDasharray="10 18"
            style={{ strokeDashoffset: dashStreamRight1 }}
          />
        </svg>
        <motion.div
          style={{ y: r1_capA }}
          className="w-[2px] h-44 bg-gradient-to-b from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] flex flex-col justify-end items-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#60a5fa] -mb-0.5" />
        </motion.div>
        <motion.div
          style={{ y: r1_capB }}
          className="w-[2px] h-44 bg-gradient-to-b from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] flex flex-col justify-end items-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#60a5fa] -mb-0.5" />
        </motion.div>
      </div>

      {/* Right Track 2: Mid Right (92.5%) */}
      <div className="absolute right-[6.5%] sm:right-[7.5%] top-0 bottom-0 w-[2px] hidden sm:block">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(14, 165, 233, 0.28)"
            strokeWidth="1.5"
            strokeDasharray="8 16"
            style={{ strokeDashoffset: dashStreamRight2 }}
          />
        </svg>
        <motion.div
          style={{ y: r2_capA }}
          className="w-[2px] h-56 bg-gradient-to-b from-transparent via-sky-500 to-transparent rounded-full shadow-[0_0_12px_rgba(14,165,233,0.55)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8] -mb-1" />
        </motion.div>
        <motion.div
          style={{ y: r2_capB }}
          className="w-[2px] h-56 bg-gradient-to-b from-transparent via-sky-500 to-transparent rounded-full shadow-[0_0_12px_rgba(14,165,233,0.55)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8] -mb-1" />
        </motion.div>
      </div>

      {/* Right Track 3: Far Right (96.5%) */}
      <div className="absolute right-[2.5%] sm:right-[3.5%] top-0 bottom-0 w-[2px]">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="rgba(13, 148, 136, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="6 14"
            style={{ strokeDashoffset: dashStreamRight3 }}
          />
        </svg>
        <motion.div
          style={{ y: r3_capA }}
          className="w-[2px] h-48 bg-gradient-to-b from-transparent via-teal-500 to-transparent rounded-full shadow-[0_0_12px_rgba(13,148,136,0.6)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] -mb-1" />
        </motion.div>
        <motion.div
          style={{ y: r3_capB }}
          className="w-[2px] h-48 bg-gradient-to-b from-transparent via-teal-500 to-transparent rounded-full shadow-[0_0_12px_rgba(13,148,136,0.6)] flex flex-col justify-end items-center"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] -mb-1" />
        </motion.div>
      </div>

      {/* 4. Full-Height Scroll-Drawing Progress Accent Lines */}
      <svg
        className="absolute left-1.5 sm:left-3 top-0 bottom-0 h-full w-4 hidden xl:block"
        viewBox="0 0 16 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M 8 0 L 8 1000"
          stroke="#0D9488"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          style={{ pathLength: smoothProgress, opacity: 0.35 }}
        />
      </svg>
      <svg
        className="absolute right-1.5 sm:right-3 top-0 bottom-0 h-full w-4 hidden xl:block"
        viewBox="0 0 16 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M 8 0 L 8 1000"
          stroke="#2563EB"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          style={{ pathLength: smoothProgress, opacity: 0.35 }}
        />
      </svg>
    </div>
  );
};

export default BackgroundCanvas;