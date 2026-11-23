import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  ShoppingBag,
  Key,
  FileCheck,
  Building2,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox,
  Send,
  Eye,
  Shield,
  Sparkles,
  Users,
  LayoutGrid,
  Rows,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import apiClient from '../../api/client';
import { Card, Badge, Button } from '../../components/Button';
import InventionCard from '../inventions/InventionCard';
import AnimatedCounter from '../../components/AnimatedCounter';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { DEFAULT_INVENTIONS } from '../../data/defaultInventions';

const DashboardPage = () => {
  const { user, isInnovator, isInvestor, isAdmin, isMentor } = useAuth();
  const isOfficial = isInvestor || isAdmin || isMentor;

  const [inventions, setInventions] = useState([]);
  const [myInventions, setMyInventions] = useState([]);
  const [offersReceived, setOffersReceived] = useState([]);
  const [offersSent, setOffersSent] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Layout: 'feed' (LinkedIn-style single column) or 'grid' (multi-column)
  const [viewLayout, setViewLayout] = useState('grid');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [maxCostFilter, setMaxCostFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [categoryFilter, regionFilter, maxCostFilter, searchKeyword]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (regionFilter !== 'All') params.append('region', regionFilter);
      if (maxCostFilter) params.append('max_cost', maxCostFilter);
      if (searchKeyword) params.append('keyword', searchKeyword);

      const [invRes, recOffersRes, sentOffersRes] = await Promise.all([
        apiClient.get(`/inventions?${params.toString()}`).catch(() => ({ data: [] })),
        apiClient.get('/offers/received').catch(() => ({ data: [] })),
        apiClient.get('/offers/sent').catch(() => ({ data: [] })),
      ]);

      let allInvs = Array.isArray(invRes.data) && invRes.data.length > 0 ? [...invRes.data] : [];
      
      // Always ensure the default reference inventions are present
      const existingTitles = new Set(allInvs.map((inv) => (inv.title || '').trim().toLowerCase()));
      for (const defInv of DEFAULT_INVENTIONS) {
        if (!existingTitles.has(defInv.title.trim().toLowerCase())) {
          allInvs.push(defInv);
          existingTitles.add(defInv.title.trim().toLowerCase());
        }
      }

      setInventions(allInvs);
      setOffersReceived(recOffersRes.data || []);
      setOffersSent(sentOffersRes.data || []);

      if (user?.id) {
        setMyInventions(allInvs.filter((inv) => String(inv.creator_id) === String(user.id)));
      }
    } catch (e) {
      console.warn('Dashboard load error, falling back to default inventions:', e);
      setInventions(DEFAULT_INVENTIONS);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Agriculture',
    'Water & Irrigation',
    'Renewable Energy',
    'Health & Sanitation',
    'Small Farm Machinery',
    'Education & Crafts',
  ];

  const regions = ['All', 'Gujarat', 'Bihar', 'Tamil Nadu', 'Maharashtra', 'Rajasthan', 'Punjab'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ============================================================== */}
      {/* 1. ROLE-TAILORED HERO BANNER (NO MANUAL VIEW SWITCHER)          */}
      {/* ============================================================== */}
      {isOfficial ? (
        /* OFFICIALS PROCUREMENT & PIPELINE BANNER */
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
                <Building2 className="w-3.5 h-3.5" />
                Officials Management & Procurement Portal • {user?.role}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Inspect, Rent & Acquire Grassroots Hardware
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Welcome, <span className="font-bold text-white">{user?.full_name}</span>. Browse verified rural innovations, inspect fabrication costs and bills of materials, and issue official Buy or Rent proposals.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/investors">
                <Button variant="primary" size="md" className="bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2 shadow-sm">
                  <Users className="w-4 h-4" />
                  <span>Investor Network</span>
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-2 font-bold">
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                  <span>Impact Analytics</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Metric Bar with Animated Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Available Technologies</div>
              <div className="text-xl font-black text-white font-mono">
                <AnimatedCounter value={inventions.length} />
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Field-Tested Units</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                <AnimatedCounter
                  value={inventions.filter((i) => i.scaling_stage === 'FIELD_TESTED' || i.scaling_stage === 'MARKET_READY').length}
                />
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Offers Issued by You</div>
              <div className="text-xl font-black text-sky-400 font-mono">
                <AnimatedCounter value={offersSent.length} />
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Pipeline Security</div>
              <div className="text-xl font-black text-amber-400 font-mono">SHA-256 IP Proof</div>
            </div>
          </div>
        </div>
      ) : (
        /* GRASSROOTS INVENTOR SHOWCASE BANNER */
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden space-y-4">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Grassroots Inventor Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Showcase Your Inventions to Officials & Investors
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-2xl">
              Welcome back, <span className="font-bold text-white">{user?.full_name}</span>. Upload your working hardware prototypes and blueprints so Government departments, NABARD, and Agritech enterprises can review, rent, or buy them.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/inventions/new">
                <Button variant="amber" size="md" className="font-extrabold shadow-md flex items-center gap-2 text-slate-950">
                  <PlusCircle className="w-5 h-5 text-slate-950" />
                  <span>+ Showcase New Invention Now</span>
                </Button>
              </Link>
              <Link to="/profile?tab=inventions">
                <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-2 font-bold">
                  <Wrench className="w-4 h-4 text-amber-300" />
                  <span>My Inventions ({myInventions.length})</span>
                </Button>
              </Link>
              <Link to="/profile?tab=offers">
                <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-2 font-bold">
                  <Inbox className="w-4 h-4 text-emerald-300" />
                  <span>Incoming Offers ({offersReceived.length})</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Metric Bar for Innovators with Animated Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-teal-700/60 text-xs">
            <div>
              <div className="text-teal-200 font-medium">My Published Units</div>
              <div className="text-xl font-black text-white font-mono">
                <AnimatedCounter value={myInventions.length} />
              </div>
            </div>
            <div>
              <div className="text-teal-200 font-medium">Incoming Commercial Offers</div>
              <div className="text-xl font-black text-emerald-300 font-mono">
                <AnimatedCounter value={offersReceived.length} />
              </div>
            </div>
            <div>
              <div className="text-teal-200 font-medium">IP Provenance Proofs</div>
              <div className="text-xl font-black text-amber-300 font-mono">100% SHA-256</div>
            </div>
            <div>
              <div className="text-teal-200 font-medium">Public Showcase Feed</div>
              <div className="text-xl font-black text-teal-300 font-mono">
                <AnimatedCounter value={inventions.length} suffix=" Inventions" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. RECENT OFFERS STRIP (FOR INVENTORS IF OFFERS EXIST)           */}
      {/* ============================================================== */}
      {!isOfficial && offersReceived.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Inquiries & Commercial Offers ({offersReceived.length})
              </h3>
            </div>
            <Link to="/profile?tab=offers" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <span>View All in Private Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {offersReceived.slice(0, 2).map((offer) => (
              <div key={offer.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{offer.organization_name}</div>
                  <div className="text-slate-500 text-[11px]">Representative: {offer.official_name}</div>
                  {offer.message && <div className="text-[11px] text-slate-600 italic line-clamp-1 mt-0.5">"{offer.message}"</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-extrabold text-teal-800 font-mono text-sm">
                    ₹{parseFloat(offer.proposed_amount || offer.amount_inr || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {offer.offer_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SHOWCASE CATALOG & LINKEDIN FEED FILTER BAR                  */}
      {/* ============================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Public Grassroots Showcase Feed</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live working prototypes, community peer reviews, and commercial acquisition listings.
            </p>
          </div>

          {/* View Mode Toggle (Grid vs Single Feed Column) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Multi-column grid view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewLayout('feed')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'feed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="LinkedIn single-column feed view"
            >
              <Rows className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hardware, innovator..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  Region: {r}
                </option>
              ))}
            </select>
          </div>

          {/* Max Cost */}
          <div>
            <input
              type="number"
              placeholder="Max Cost (₹) e.g. 5000"
              value={maxCostFilter}
              onChange={(e) => setMaxCostFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
        </div>

        {/* Active Filters Reset */}
        {(categoryFilter !== 'All' || regionFilter !== 'All' || maxCostFilter || searchKeyword) && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Filtering by active parameters</span>
            <button
              onClick={() => {
                setCategoryFilter('All');
                setRegionFilter('All');
                setMaxCostFilter('');
                setSearchKeyword('');
              }}
              className="text-teal-700 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. SHOWCASE CATALOG FEED / GRID                                 */}
      {/* ============================================================== */}
      {loading ? (
        <LoadingSkeleton count={viewLayout === 'feed' ? 3 : 6} type={viewLayout === 'feed' ? 'feed' : 'card'} />
      ) : inventions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-500">No inventions matched your filter criteria.</p>
          <button
            onClick={() => {
              setCategoryFilter('All');
              setRegionFilter('All');
              setMaxCostFilter('');
              setSearchKeyword('');
            }}
            className="text-xs font-bold text-teal-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : viewLayout === 'feed' ? (
        /* LinkedIn-Style Single Column Feed (Max 700px width centered) */
        <div className="max-w-2xl mx-auto space-y-6">
          {inventions.map((inv) => (
            <InventionCard key={inv.id} invention={inv} onUpdate={fetchDashboardData} />
          ))}
        </div>
      ) : (
        /* Multi-column Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventions.map((inv) => (
            <InventionCard key={inv.id} invention={inv} onUpdate={fetchDashboardData} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
