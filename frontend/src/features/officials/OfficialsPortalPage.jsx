import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  Star,
  CheckCircle2,
  Users,
  Award,
  Layers,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  MapPin,
  TrendingUp,
  FileText,
  DollarSign,
  Maximize2,
  X,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import CommercialOfferModal from '../offers/CommercialOfferModal';

const OfficialsPortalPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer' | 'shortlist' | 'directory'
  const [overview, setOverview] = useState(null);
  const [inventions, setInventions] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [innovators, setInnovators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Blueprint Zoom Modal State
  const [zoomBlueprint, setZoomBlueprint] = useState(null);

  // Commercial Offer Modal State
  const [selectedOfferInvention, setSelectedOfferInvention] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    fetchOfficialsData();
  }, []);

  const fetchOfficialsData = async () => {
    setLoading(true);
    try {
      const [overviewRes, invRes, shortRes, innovRes] = await Promise.all([
        apiClient.get('/officials/overview'),
        apiClient.get('/inventions', { params: { limit: 50, sort_by: 'popular' } }),
        apiClient.get('/officials/shortlist'),
        apiClient.get('/officials/innovators'),
      ]);

      setOverview(overviewRes.data);
      setInventions(invRes.data);
      setShortlist(shortRes.data);
      setInnovators(innovRes.data);
    } catch (e) {
      console.warn('Failed to load officials data', e);
    } finally {
      setLoading(false);
    }
  };

  const isShortlisted = (invId) => {
    return shortlist.some((item) => item.invention?.id === invId);
  };

  const handleToggleShortlist = async (inv) => {
    const already = isShortlisted(inv.id);
    try {
      if (already) {
        await apiClient.delete(`/officials/shortlist/${inv.id}`);
        setShortlist((prev) => prev.filter((item) => item.invention?.id !== inv.id));
        setOverview((prev) => ({ ...prev, total_shortlisted: Math.max(0, (prev?.total_shortlisted || 1) - 1) }));
      } else {
        const res = await apiClient.post('/officials/shortlist', {
          invention_id: inv.id,
          notes: 'Shortlisted from Officials Explorer',
        });
        setShortlist((prev) => [
          {
            id: res.data.id,
            invention: inv,
            notes: 'Shortlisted from Officials Explorer',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setOverview((prev) => ({ ...prev, total_shortlisted: (prev?.total_shortlisted || 0) + 1 }));
      }
    } catch (err) {
      alert('Failed to update shortlist status.');
    }
  };

  const filteredInventions = inventions.filter((inv) => {
    const matchCat = selectedCategory === 'All' || inv.category === selectedCategory;
    const matchQuery =
      !searchQuery ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.creator_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const categories = [
    'All',
    'Agriculture',
    'Water & Irrigation',
    'Renewable Energy',
    'Health & Sanitation',
    'Small Farm Machinery',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-900/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Executive Officials & Investor Portal</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Verified Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.full_name || 'Official Reviewer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore field-tested frugal hardware, review CAD blueprints, shortlist proven machines for government replication or CSR grants, and initiate direct commercial adoption.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/discover"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
            >
              <span>Public Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setActiveTab('shortlist')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>My Shortlist ({shortlist.length})</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. TOP METRICS STRIP (5 KPI CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Approved Inventions</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.total_inventions ?? inventions.length}
          </div>
          <div className="text-[10px] text-slate-500">Verified open blueprints</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Rural Innovators</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.total_innovators ?? innovators.length}
          </div>
          <div className="text-[10px] text-slate-500">Across 20+ Indian states</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>My Shortlisted</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.total_shortlisted ?? shortlist.length}
          </div>
          <div className="text-[10px] text-slate-500">Saved for review & funding</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Commercial Inquiries</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.total_commercial_offers ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Buy, rent & paid reuses</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grants Pledged</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{Number(overview?.total_grants_pledged || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">Committed CSR & grants</div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'explorer'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Hardware & Blueprint Explorer</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {filteredInventions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shortlist')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'shortlist'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>My Shortlist & Chosen Picks</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {shortlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Rural Innovators Directory</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">
              {innovators.length}
            </span>
          </button>
        </nav>
      </div>

      {/* 4. TAB 1: HARDWARE & BLUEPRINT EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by machine title, problem solved, inventor, or region..."
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500">Loading inventions catalog...</div>
          ) : filteredInventions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No innovations found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInventions.map((inv) => {
                const shortlisted = isShortlisted(inv.id);
                return (
                  <motion.div
                    key={inv.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-soft overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Invention Photo */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden group">
                        <img
                          src={inv.image_url || '/images/inventions/solar-drip.svg'}
                          alt={inv.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = '/images/inventions/solar-drip.svg'; }}
                        />

                        {/* Top Shortlist Button */}
                        <button
                          onClick={() => handleToggleShortlist(inv)}
                          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
                            shortlisted
                              ? 'bg-amber-400 text-white'
                              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-amber-500'
                          }`}
                          title={shortlisted ? 'Remove from shortlist' : 'Add to official shortlist'}
                        >
                          <Star className={`w-4 h-4 ${shortlisted ? 'fill-white' : ''}`} />
                        </button>

                        {/* Blueprint Quick Inspect Pill */}
                        {inv.blueprint_url && (
                          <button
                            onClick={() => setZoomBlueprint(inv.blueprint_url)}
                            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-900"
                          >
                            <FileText className="w-3 h-3 text-sky-400" />
                            <span>Quick Inspect Blueprint</span>
                          </button>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {inv.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {inv.region}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                          {inv.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {inv.description}
                        </p>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Fabrication Cost</span>
                            <span className="font-black text-slate-900 font-mono">₹{Number(inv.total_cost || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Safety Score</span>
                            <span className="font-black text-emerald-600 font-mono">{inv.safety_score || 95}/100</span>
                          </div>
                        </div>

                        {/* Creator Tag */}
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                          <img
                            src={inv.creator_photo_url || '/images/avatars/default.jpg'}
                            alt={inv.creator_name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                            onError={(e) => { e.target.src = '/images/avatars/default.jpg'; }}
                          />
                          <span className="font-bold truncate">{inv.creator_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/inventions/${inv.id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
                      >
                        Inspect Details
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedOfferInvention(inv);
                          setIsOfferModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Procure / License</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: MY SHORTLIST & CHOSEN PICKS */}
      {activeTab === 'shortlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Your Starred Official Shortlist</h2>
              <p className="text-xs text-slate-500">Inventions bookmarked for government replication, CSR grants, or bulk rural procurement.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              {shortlist.length} Items Saved
            </span>
          </div>

          {shortlist.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
              <Star className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Your shortlist is currently empty.</p>
              <p className="text-xs text-slate-400">Click the star button on any invention card in the Explorer to save it here.</p>
              <button
                onClick={() => setActiveTab('explorer')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Inventions Explorer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {shortlist.map((item) => {
                const inv = item.invention;
                if (!inv) return null;
                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <img
                          src={inv.image_url || '/images/inventions/solar-drip.svg'}
                          alt={inv.title}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {inv.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {inv.title}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>By <strong>{inv.creator_name}</strong></span>
                          <span>•</span>
                          <span>{inv.region}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-800">₹{Number(inv.total_cost || 0).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Link
                        to={`/inventions/${inv.id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Inspect Blueprint
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedOfferInvention(inv);
                          setIsOfferModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Procure / License</span>
                      </button>

                      <button
                        onClick={() => handleToggleShortlist(inv)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove from shortlist"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: RURAL INNOVATORS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Verified Grassroots Innovators Directory</h2>
            <p className="text-xs text-slate-500">Contact village makers, workshop fabrication heads, and frugal engineers directly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovators.map((innovator) => (
              <div
                key={innovator.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={innovator.profile_photo_url || '/images/avatars/default.jpg'}
                      alt={innovator.full_name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20 shadow-xs"
                      onError={(e) => { e.target.src = '/images/avatars/default.jpg'; }}
                    />
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{innovator.full_name}</h4>
                      {innovator.username && (
                        <p className="text-xs font-mono text-slate-500">@{innovator.username}</p>
                      )}
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        <span>{innovator.village_city || 'Rural Region'}, {innovator.state || 'India'}</span>
                      </p>
                    </div>
                  </div>

                  {innovator.top_inventions && innovator.top_inventions.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">
                        Published Machines ({innovator.inventions_count}):
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {innovator.top_inventions.map((t, idx) => (
                          <li key={idx} className="truncate font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Innovator
                  </span>

                  <Link
                    to="/messages"
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. BLUEPRINT QUICK INSPECT LIGHTBOX MODAL */}
      {zoomBlueprint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="font-black text-sm">CAD Blueprint & Engineering Schematic</h3>
              </div>
              <button
                onClick={() => setZoomBlueprint(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-[520px] bg-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center overflow-auto">
              <img
                src={zoomBlueprint}
                alt="Blueprint schematic"
                className="max-h-full max-w-full object-contain filter drop-shadow"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Open Hardware Blueprint • Verified Dimensions & Tolerances</span>
              <button
                onClick={() => setZoomBlueprint(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. COMMERCIAL OFFER & PROCUREMENT MODAL */}
      {selectedOfferInvention && isOfferModalOpen && (
        <CommercialOfferModal
          invention={selectedOfferInvention}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedOfferInvention(null);
            fetchOfficialsData();
          }}
        />
      )}
    </div>
  );
};

export default OfficialsPortalPage;
