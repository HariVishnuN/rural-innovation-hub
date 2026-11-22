import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Lightbulb,
  Shield,
  Wrench,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Droplets,
  Leaf,
  Globe2,
  CheckCircle2,
  Play,
  Layers,
  Cpu,
} from 'lucide-react';
import apiClient from '../api/client';
import { Button, Card, Badge } from '../components/Button';
import InventionCard from '../features/inventions/InventionCard';
import InteractiveBlueprint3D from '../components/InteractiveBlueprint3D';
import { useUltraLite } from '../app/UltraLiteContext';

const LandingPage = () => {
  const { ultraLite } = useUltraLite();
  const [summary, setSummary] = useState(null);
  const [featuredInventions, setFeaturedInventions] = useState([]);

  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 45]);
  const heroBlueprintY = useTransform(scrollY, [0, 500], [0, -35]);

  useEffect(() => {
    // Live SQL impact counters from backend
    apiClient.get('/impact/summary').then((res) => setSummary(res.data)).catch(() => {});
    apiClient.get('/inventions/featured').then((res) => setFeaturedInventions(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section with Parallax Scrolling & Staggered Animations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-12 overflow-hidden">
        <motion.div
          style={ultraLite ? undefined : { y: heroTextY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>Frugal Engineering & Grassroots IP Provenance</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Open Hardware for the Next <span className="bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">Billion Rural Makers</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Document, protect with SHA-256 timestamps, fund, and replicate frugally engineered farming machinery and community clean-tech innovations.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/discover">
              <Button variant="primary" size="lg" className="font-bold shadow-md">
                Showcase Catalog <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="font-bold border-teal-600 text-teal-800 hover:bg-teal-50 shadow-sm">
                Inventor Portal
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="amber" size="lg" className="font-bold shadow-sm">
                Officials & Investor Login
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Interactive 3D Blueprint CAD Showcase in Hero (Faux 3D Tilt, Cinemagraph & Stop-Motion) */}
        <motion.div
          style={ultraLite ? undefined : { y: heroBlueprintY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-12"
        >
          <InteractiveBlueprint3D
            title="Solar-Powered Drip Irrigation System"
            cost="₹3,200"
            co2="340 kg"
            water="18,500 L"
            stage="Field-Tested"
          />
        </motion.div>

        {/* Two Clear Portals Callout with Hover Lift */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
          <motion.div
            whileHover={ultraLite ? undefined : { y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 shadow-xs flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-teal-600 text-white flex-shrink-0 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block">For Rural Innovators</span>
              <h3 className="text-sm font-black text-slate-900">Showcase Your Inventions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload blueprints, photo prototypes, and fabrication costs. Receive commercial Buy, Rent, or Licensing offers from Government and Investors.
              </p>
              <Link to="/inventions/new" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 pt-1">
                <span>Add Your Invention</span> &rarr;
              </Link>
            </div>
          </motion.div>

          <motion.div
            whileHover={ultraLite ? undefined : { y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 shadow-xs flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-sky-600 text-white flex-shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 block">For Officials & Investors</span>
              <h3 className="text-sm font-black text-slate-900">View, Rent & Buy Hardware</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect vetted rural innovations, review Bill of Materials, and submit official procurement, field-lease, or manufacturing licensing proposals.
              </p>
              <Link to="/discover" className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 pt-1">
                <span>Inspect All Inventions</span> &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live SQL-Powered Impact Counters */}
      <section className="bg-white border-y border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-700">
                {summary ? summary.total_inventions : '8+'}
              </div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Documented Blueprints
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-700">
                {summary ? summary.total_replications : '3+'}
              </div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Field Replications
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                {summary ? `${(parseFloat(summary.total_co2_saved_kg) / 1000).toFixed(1)} T` : '3.2 T'}
              </div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                CO₂ Emissions Avoided
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-700">
                {summary ? `₹${parseFloat(summary.total_funding_pledged).toLocaleString()}` : '₹40,000'}
              </div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Pledged Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Approved Innovations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Open Blueprints</h2>
            <p className="text-xs text-slate-500 mt-1">
              Tested, step-by-step DIY specifications using locally available materials.
            </p>
          </div>
          <Link to="/discover" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredInventions.slice(0, 6).map((inv) => (
            <InventionCard key={inv.id} invention={inv} />
          ))}
        </div>
      </section>

      {/* WHY RURAL INNOVATION HUB: 4 Solution Pillars & Problem-Solution Alignment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Problem-Solution Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Rural Innovation Hub?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every year, thousands of grassroots engineering breakthroughs die inside village sheds. We built the 4 foundational pillars to bridge the gap between rural makers and institutional scaling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <motion.div
            whileHover={ultraLite ? undefined : { y: -8, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4 hover:border-teal-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200 shadow-2xs">
                01
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Solves: Invisible Innovations
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-2">Digital Showcase</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replaces undocumented oral ideas with high-contrast hardware photography, interactive CAD blueprints, and transparent Bill of Materials (BOM).
              </p>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 pt-2">
              Explore Showcase &rarr;
            </Link>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            whileHover={ultraLite ? undefined : { y: -8, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4 hover:border-sky-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg border border-sky-200 shadow-2xs">
                02
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Solves: Discovery Barrier
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-2">Direct Networking & Pitch</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct connection connecting rural inventors to NABARD officials, agritech angels, and CSR foundations without middleman fees or paperwork roadblocks.
              </p>
            </div>
            <Link to="/investors" className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 pt-2">
              Find Investors &rarr;
            </Link>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            whileHover={ultraLite ? undefined : { y: -8, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-200 shadow-2xs">
                03
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Solves: High R&D Costs
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-2">Open-Source Repository</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step assembly guides with heuristic scrap yard substitutions that cut fabrication costs by up to 60% using local auto scrap and PVC pipes.
              </p>
            </div>
            <Link to="/ip-resources" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 pt-2">
              IP & BOM Guide &rarr;
            </Link>
          </motion.div>

          {/* Pillar 4 */}
          <motion.div
            whileHover={ultraLite ? undefined : { y: -8, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4 hover:border-emerald-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200 shadow-2xs">
                04
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Solves: Scaling Failure
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-2">Readiness & Validation Tracker</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A 4-stage validation pipeline (Raw Prototype &rarr; Peer Validated &rarr; Field-Tested &rarr; Market-Ready) proving durability before government procurement.
              </p>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2">
              View Verified Hardware &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Frugal Engineering Manifesto Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Our Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">The Grassroots Open Hardware Flywheel</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We empower rural artisans with modern technology without trapping them in predatory intellectual property loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <Shield className="w-6 h-6 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Cryptographic Prior Art</h3>
              <p className="text-xs text-slate-400">
                SHA-256 content hashing creates immutable evidence to stop companies from patenting ancient or village wisdom.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <Wrench className="w-6 h-6 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Local Scrap Optimization</h3>
              <p className="text-xs text-slate-400">
                Heuristic BOM optimizer substitutes expensive virgin parts with discarded bicycle hubs and rewired motors.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <Users className="w-6 h-6 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Village-to-Village Replication</h3>
              <p className="text-xs text-slate-400">
                Farmers across different agro-climatic zones record builds, adapting the core mechanism to local soil.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
