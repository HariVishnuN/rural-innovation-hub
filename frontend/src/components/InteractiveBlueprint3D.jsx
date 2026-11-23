import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Wrench,
  Droplets,
  Sun,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react';
import { useUltraLite } from '../app/UltraLiteContext';

/**
 * InteractiveBlueprint3D
 * Advanced visual showcase featuring:
 * 1. Faux 3D Card Tilt with specular glare tracking cursor.
 * 2. Animated SVG Schematics (kinetic gears, fluid flow lines, circuit traces).
 * 3. Cinemagraph Simulation (living ambient pulses, solar rays, fluid ripple).
 * 4. Stop-Motion Mechanical Assembly Player (step-by-step fabrication frames).
 * 5. Interactive Hotspot Pins with component cost & scrap tips.
 */
const InteractiveBlueprint3D = ({
  title = 'Solar-Powered Drip Irrigation System',
  cost = '₹3,200',
  co2 = '340 kg',
  water = '18,500 L',
  stage = 'Field-Tested',
}) => {
  const { ultraLite } = useUltraLite();
  const cardRef = useRef(null);

  // Active view: 'schematic' | 'cinemagraph' | 'stopmotion'
  const [activeMode, setActiveMode] = useState('schematic');

  // 3D Tilt & Glare Coordinates
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Stop-motion player state
  const [stopMotionStep, setStopMotionStep] = useState(0);
  const [isPlayingStopMotion, setIsPlayingStopMotion] = useState(false);

  // Selected Interactive Hotspot Pin
  const [activePin, setActivePin] = useState(null);

  const STOP_MOTION_FRAMES = [
    {
      frame: 1,
      title: 'Frame & Scaffold Assembly',
      desc: '2-inch scrap mild steel square pipe cut to 1.2m and welded into rigid triangle base.',
      mat: 'Scrap iron pipe (₹350)',
      source: 'Local tractor workshop',
    },
    {
      frame: 2,
      title: 'Reservoir & 12V DC Pump Fitting',
      desc: '200L food-grade barrel mounted at 1.5m gravity head, plumbed to 40W solar diaphragm booster pump.',
      mat: 'Reused HDPE barrel (₹500)',
      source: 'Village dairy cooperative',
    },
    {
      frame: 3,
      title: 'Pressure Regulator & Drip Manifold',
      desc: 'Screen filter with scrap tire inner-tube vibration dampers and 16mm LDPE mainline sub-distribution.',
      mat: 'Micro-drippers & valves (₹620)',
      source: 'Panchayat hardware store',
    },
    {
      frame: 4,
      title: 'Full Operational Field Run (1.2 Bar)',
      desc: 'Zero-clog micro-emitters delivering 2.4 L/hr uniform root-zone irrigation powered purely by solar panel.',
      mat: '40W Solar PV Module (₹1,400)',
      source: 'Rural solar cooperative',
    },
  ];

  // Auto-play stop-motion loop
  useEffect(() => {
    let timer;
    if (isPlayingStopMotion) {
      timer = setInterval(() => {
        setStopMotionStep((prev) => (prev + 1) % STOP_MOTION_FRAMES.length);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlayingStopMotion]);

  // Handle 3D mouse tracking tilt
  const handleMouseMove = (e) => {
    if (ultraLite || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -10;
    const rY = ((x - centerX) / centerX) * 10;

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto py-2 perspective-[1200px]">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={
          ultraLite
            ? undefined
            : {
                rotateX,
                rotateY,
              }
        }
        transition={{ type: 'spring', damping: 20, stiffness: 220 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border-2 border-teal-500/30 hover:border-teal-400/80 shadow-2xl hover:shadow-[0_20px_50px_rgba(13,148,136,0.18)] transition-all duration-300 overflow-hidden p-5 sm:p-7 text-white select-none"
      >
        {/* Specular Interactive Glass Glare */}
        {!ultraLite && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)`,
            }}
          />
        )}

        {/* Header Ribbon with Mode Controls */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_#2dd4bf]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
              Interactive 3D Blueprint CAD
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
              {stage}
            </span>
          </div>

          {/* Mode Switcher Tabs with Animated Sliding Pill */}
          <div className="flex items-center bg-slate-800/80 backdrop-blur-xs p-1 rounded-xl border border-slate-700/80 text-xs font-bold relative">
            {[
              { id: 'schematic', label: 'Schematic', icon: Cpu, activeBg: 'bg-teal-600' },
              { id: 'cinemagraph', label: 'Cinemagraph', icon: Sparkles, activeBg: 'bg-sky-600' },
              { id: 'stopmotion', label: 'Stop-Motion', icon: Layers, activeBg: 'bg-amber-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMode(tab.id)}
                  className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer z-10 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="blueprint-tab-pill"
                      className={`absolute inset-0 ${tab.activeBg} rounded-lg shadow-sm`}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Visual Stage Viewport */}
        <div className="relative h-72 sm:h-80 w-full bg-slate-950/90 rounded-2xl border border-slate-800 mt-4 overflow-hidden flex items-center justify-center">
          {/* Engineering Blueprint Background Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #0D9488 1px, transparent 1px), linear-gradient(to bottom, #0D9488 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* ============================================================== */}
          {/* VIEW 1: INTERACTIVE SVG SCHEMATIC WITH ANIMATED FLUID & GEARS  */}
          {/* ============================================================== */}
          {activeMode === 'schematic' && (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <svg className="w-full h-full max-w-lg" viewBox="0 0 500 280">
                {/* Defs for gradients & patterns */}
                <defs>
                  <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                  <linearGradient id="solarGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Ground Line */}
                <line x1="20" y1="240" x2="480" y2="240" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

                {/* 1. Water Drum (Reservoir) */}
                <g className="cursor-pointer" onClick={() => setActivePin('barrel')}>
                  <rect x="50" y="70" width="90" height="130" rx="12" fill="#0F172A" stroke="#0D9488" strokeWidth="2" />
                  <line x1="50" y1="105" x2="140" y2="105" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="50" y1="150" x2="140" y2="150" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <text x="95" y="130" fill="#94A3B8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    200L BARREL
                  </text>
                  {/* Fluid Level Wave */}
                  <path
                    d="M 52 140 Q 72 135, 95 140 T 138 140 L 138 198 Q 95 200, 52 198 Z"
                    fill="rgba(14, 165, 233, 0.3)"
                  />
                </g>

                {/* Stilt Scaffold Legs */}
                <line x1="60" y1="200" x2="45" y2="240" stroke="#64748B" strokeWidth="3" />
                <line x1="130" y1="200" x2="145" y2="240" stroke="#64748B" strokeWidth="3" />
                <line x1="60" y1="220" x2="130" y2="220" stroke="#475569" strokeWidth="2" />

                {/* 2. Solar Panel Array */}
                <g className="cursor-pointer" onClick={() => setActivePin('solar')}>
                  <polygon points="180,50 250,30 260,75 190,95" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                  {/* Solar grid lines */}
                  <line x1="215" y1="40" x2="225" y2="85" stroke="#F59E0B" strokeWidth="1" opacity="0.7" />
                  <line x1="185" y1="72" x2="255" y2="52" stroke="#F59E0B" strokeWidth="1" opacity="0.7" />
                  {/* Stand */}
                  <line x1="225" y1="85" x2="225" y2="170" stroke="#64748B" strokeWidth="2.5" />
                  <text x="220" y="24" fill="#F59E0B" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    40W PV PANEL
                  </text>
                </g>

                {/* 3. 12V DC Booster Pump with Rotating Impeller */}
                <g className="cursor-pointer" onClick={() => setActivePin('pump')}>
                  <rect x="205" y="170" width="40" height="40" rx="8" fill="#0D9488" stroke="#14B8A6" strokeWidth="2" />
                  {/* Rotating gear icon */}
                  <circle cx="225" cy="190" r="12" fill="#0F766E" stroke="#5EEAD4" strokeWidth="1.5" />
                  <path
                    d="M 225 178 L 225 202 M 213 190 L 237 190 M 216 181 L 234 199 M 216 199 L 234 181"
                    stroke="#CCFBF1"
                    strokeWidth="1.5"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 225 190"
                      to="360 225 190"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <text x="225" y="222" fill="#5EEAD4" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    12V PUMP
                  </text>
                </g>

                {/* 4. Conduit Piping with Animated Flow Dashes */}
                {/* Barrel to Pump */}
                <path
                  d="M 140 185 L 205 185"
                  stroke="url(#pipeGrad)"
                  strokeWidth="3.5"
                  fill="none"
                />
                <path
                  d="M 140 185 L 205 185"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  fill="none"
                >
                  <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />
                </path>

                {/* Pump to Drip Manifold */}
                <path
                  d="M 245 190 L 310 190 L 310 230 L 460 230"
                  stroke="url(#pipeGrad)"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M 245 190 L 310 190 L 310 230 L 460 230"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                  fill="none"
                >
                  <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" />
                </path>

                {/* 5. Field Crops & Micro-Drip Emitters */}
                {[340, 390, 440].map((cx, i) => (
                  <g key={i} className="cursor-pointer" onClick={() => setActivePin('dripper')}>
                    {/* Emitter drop */}
                    <circle cx={cx} cy="230" r="3" fill="#38BDF8" />
                    <circle cx={cx} cy="236" r="2" fill="#38BDF8" opacity="0.8">
                      <animate attributeName="cy" from="232" to="240" dur="1.2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                    </circle>
                    {/* Sprout Plant */}
                    <path
                      d={`M ${cx} 240 Q ${cx - 6} 226, ${cx - 10} 224 Q ${cx - 3} 228, ${cx} 234 Q ${cx + 4} 226, ${cx + 10} 222 Q ${cx + 4} 228, ${cx} 240`}
                      fill="#10B981"
                      stroke="#059669"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Technical Dimension Callouts */}
                <g opacity="0.5">
                  <line x1="50" y1="58" x2="140" y2="58" stroke="#0D9488" strokeWidth="1" />
                  <line x1="50" y1="54" x2="50" y2="62" stroke="#0D9488" strokeWidth="1" />
                  <line x1="140" y1="54" x2="140" y2="62" stroke="#0D9488" strokeWidth="1" />
                  <text x="95" y="52" fill="#2DD4BF" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    Ø 580mm
                  </text>
                </g>
              </svg>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: CINEMAGRAPH SIMULATION (LIVING FLUID & SOLAR RADIANCE) */}
          {/* ============================================================== */}
          {activeMode === 'cinemagraph' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
              {/* Pulsating solar irradiance rings */}
              <div className="absolute top-6 right-8 w-28 h-28 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              <div className="absolute top-10 right-12 w-20 h-20 rounded-full border border-amber-400/40 animate-ping opacity-30" />

              {/* Ambient fluid wave particle effect */}
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-mono font-bold">
                  <Droplets className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                  <span>Cinemagraph Kinetic Simulation Active</span>
                </div>
                <h4 className="text-xl font-black text-white">
                  Continuous Zero-Carbon Pressure Regulation
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Real-time micro-dripping operating at 1.2 Bar static head without fossil fuels or battery degradation. Conserves 65% water compared to furrow flooding.
                </p>

                <div className="pt-3 flex flex-wrap justify-center gap-3 text-xs font-mono">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-teal-300 font-bold">
                    FLOW: 2.4 L/hr
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-amber-300 font-bold">
                    SOLAR: 40W @ 12V
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-emerald-300 font-bold">
                    WATER SAVED: {water}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: STOP-MOTION MECHANICAL ASSEMBLY PLAYER                */}
          {/* ============================================================== */}
          {activeMode === 'stopmotion' && (
            <div className="relative w-full h-full flex flex-col justify-between p-5 sm:p-6">
              {/* Frame Counter & Status */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    FRAME 0{STOP_MOTION_FRAMES[stopMotionStep].frame} / 0{STOP_MOTION_FRAMES.length}
                  </span>
                  <span className="text-slate-400 font-bold">
                    {STOP_MOTION_FRAMES[stopMotionStep].title}
                  </span>
                </div>

                <button
                  onClick={() => setIsPlayingStopMotion(!isPlayingStopMotion)}
                  className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isPlayingStopMotion ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlayingStopMotion ? 'Pause' : 'Play Stop-Motion'}</span>
                </button>
              </div>

              {/* Stop-Motion Frame Content with Subtle Spring Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={stopMotionStep}
                  initial={{ opacity: 0, scale: 0.95, rotate: -0.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.03, rotate: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-4 space-y-2 shadow-inner"
                >
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {STOP_MOTION_FRAMES[stopMotionStep].desc}
                  </p>
                  <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800">
                    <span className="font-semibold text-teal-300 font-mono">
                      Component: {STOP_MOTION_FRAMES[stopMotionStep].mat}
                    </span>
                    <span className="text-slate-400">
                      Sourced from: <strong className="text-slate-200">{STOP_MOTION_FRAMES[stopMotionStep].source}</strong>
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Step Navigation Dots & Scrub Bar */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 flex-1">
                  {STOP_MOTION_FRAMES.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setStopMotionStep(idx);
                        setIsPlayingStopMotion(false);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer flex-1 ${
                        stopMotionStep === idx
                          ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          : idx < stopMotionStep
                          ? 'bg-teal-500'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setStopMotionStep(0);
                    setIsPlayingStopMotion(true);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Restart sequence"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Holographic Depth Tags (3D Transform Layer) */}
        <div
          className="relative z-20 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Build Cost</div>
            <div className="text-base font-black text-teal-400">{cost}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">CO₂ Offset</div>
            <div className="text-base font-black text-emerald-400">{co2}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Water Saved</div>
            <div className="text-base font-black text-sky-400">{water}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">SHA-256 IP</div>
            <div className="text-xs font-black text-amber-400 truncate mt-1">Verified Proof</div>
          </div>
        </div>

        {/* Interactive Hotspot Tooltip */}
        {activePin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-teal-950/80 border border-teal-500/40 text-xs text-teal-100 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                {activePin === 'barrel' && '200L Drum: Evaluated for gravity head pressure; eliminates high-power pumps.'}
                {activePin === 'solar' && '40W Monocrystalline: Direct DC link avoids inverter & battery lifecycle costs.'}
                {activePin === 'pump' && '12V Booster: Reclaimed scooter DC pump with custom 3D-printed impeller.'}
                {activePin === 'dripper' && 'Micro-Drippers: Compensating labyrinth emitters deliver uniform moisture.'}
              </span>
            </div>
            <button
              onClick={() => setActivePin(null)}
              className="text-[10px] px-2 py-0.5 rounded bg-teal-800 text-white font-bold cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default InteractiveBlueprint3D;