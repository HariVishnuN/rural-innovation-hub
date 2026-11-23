import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  Wrench,
  Compass,
  RotateCcw,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { useUltraLite } from '../../app/UltraLiteContext';
import InventionCard from '../inventions/InventionCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { DEFAULT_INVENTIONS } from '../../data/defaultInventions';
import { useToast } from '../../components/Toast';

const DiscoverPage = () => {
  const { user } = useAuth();
  const { ultraLite } = useUltraLite();
  const { showToast } = useToast();
  const [inventions, setInventions] = useState(DEFAULT_INVENTIONS);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'grid'

  // Filters
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');
  const [maxCost, setMaxCost] = useState(50000);
  const [sortBy, setSortBy] = useState('newest');

  // Parallax Header Drift
  const { scrollY } = useScroll();
  const headerDriftY = useTransform(scrollY, [0, 400], [0, -25]);
  const tagFloatY1 = useTransform(scrollY, [0, 500], [0, 35]);
  const tagFloatY2 = useTransform(scrollY, [0, 500], [0, -30]);

  const categories = [
    'All',
    'Agriculture',
    'Water & Irrigation',
    'Renewable Energy',
    'Health & Sanitation',
    'Small Farm Machinery',
    'Education & Crafts',
  ];

  const states = [
    'All',
    'Gujarat',
    'Bihar',
    'Tamil Nadu',
    'Maharashtra',
    'Punjab',
    'Karnataka',
    'Rajasthan',
  ];

  useEffect(() => {
    fetchInventions();
  }, [category, region, maxCost, sortBy]);

  const applyClientFiltersAndSort = (items) => {
    let filtered = [...items];

    if (keyword.trim()) {
      const term = keyword.trim().toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.title?.toLowerCase().includes(term) ||
          inv.description?.toLowerCase().includes(term) ||
          inv.creator_name?.toLowerCase().includes(term) ||
          inv.category?.toLowerCase().includes(term) ||
          inv.region?.toLowerCase().includes(term)
      );
    }

    if (category !== 'All') {
      filtered = filtered.filter(
        (inv) => inv.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (region !== 'All') {
      filtered = filtered.filter((inv) =>
        (inv.region || inv.creator_state || '')
          .toLowerCase()
          .includes(region.toLowerCase())
      );
    }

    if (maxCost && maxCost > 0) {
      filtered = filtered.filter(
        (inv) => parseFloat(inv.total_cost || 0) <= maxCost
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'most_liked':
          return (Number(b.likes_count) || 0) - (Number(a.likes_count) || 0);
        case 'popular':
          return (Number(b.views_count) || 0) - (Number(a.views_count) || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'cost_asc':
          return parseFloat(a.total_cost || 0) - parseFloat(b.total_cost || 0);
        case 'cost_desc':
          return parseFloat(b.total_cost || 0) - parseFloat(a.total_cost || 0);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'innovator_asc':
          return (a.creator_name || '').localeCompare(b.creator_name || '');
        case 'field_tested':
          return (b.field_tested ? 1 : 0) - (a.field_tested ? 1 : 0);
        case 'newest':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    return filtered;
  };

  const fetchInventions = async () => {
    setLoading(true);
    try {
      const params = {
        category: category !== 'All' ? category : undefined,
        region: region !== 'All' ? region : undefined,
        max_cost: maxCost,
        sort_by: sortBy,
        keyword: keyword.trim() || undefined,
      };
      const res = await apiClient.get('/inventions', { params });
      
      let combined = Array.isArray(res.data) ? [...res.data] : [];
      
      // Merge with default reference inventions so they are NEVER missing
      const existingTitles = new Set(
        combined.map((inv) => (inv.title || '').trim().toLowerCase())
      );
      
      for (const defInv of DEFAULT_INVENTIONS) {
        if (!existingTitles.has(defInv.title.trim().toLowerCase())) {
          combined.push(defInv);
          existingTitles.add(defInv.title.trim().toLowerCase());
        }
      }

      const finalInventions = applyClientFiltersAndSort(combined);
      setInventions(finalInventions);
    } catch (e) {
      console.warn('Backend unavailable, using verified reference inventions:', e);
      // Fallback gracefully to default inventions with active filters and sorting
      const finalInventions = applyClientFiltersAndSort(DEFAULT_INVENTIONS);
      setInventions(finalInventions);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('All');
    setRegion('All');
    setMaxCost(50000);
    setSortBy('newest');
    showToast('🔄 Filters reset to all verified innovations', 'reset');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventions();
  };

  // Staggered Container Animation Variants (40-60ms gentle glide)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: ultraLite ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Parallax Header with Title, Floating Chips, and Create Invention CTA */}
      <motion.div
        style={ultraLite ? undefined : { y: headerDriftY }}
        className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2"
      >
        <div className="relative">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Public Innovation Feed
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 inline-flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Live Showcase
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Browse, like, comment, and pay to reuse grassroots machines built by village makers and agricultural innovators.
          </p>

          {/* Floating Subtle Parallax Accent Icons */}
          {!ultraLite && (
            <>
              <motion.div
                style={{ y: tagFloatY1 }}
                className="hidden lg:flex absolute -right-24 -top-3 items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-teal-200/80 text-[11px] font-bold text-teal-700 shadow-sm pointer-events-none"
              >
                <Cpu className="w-3.5 h-3.5 text-teal-600" />
                <span>Open Hardware</span>
              </motion.div>
              <motion.div
                style={{ y: tagFloatY2 }}
                className="hidden lg:flex absolute -right-48 top-8 items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-sky-200/80 text-[11px] font-bold text-sky-700 shadow-sm pointer-events-none"
              >
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>Verified Field Tests</span>
              </motion.div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Animated View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'feed'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Feed View</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </motion.button>
          </div>

          {/* Tactile Press & Elevation on Showcase Invention Button */}
          <Link to="/inventions/new">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ Showcase New Invention Now</span>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Search & Filter Bar with Animated Hover Elevate */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-md transition-shadow space-y-4"
      >
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by invention name, technology, crop, inventor, or district..."
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-teal-500/25 transition-all shimmer-btn-fx cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </motion.button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">State / Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Cost Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600">Max Budget:</label>
              <span className="text-[11px] font-bold text-teal-700 font-mono">₹{maxCost.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={maxCost}
              onChange={(e) => setMaxCost(parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sort & Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            >
              <option value="newest">📅 Decreasing Order of Date (Newest First)</option>
              <option value="oldest">⏳ Increasing Order of Date (Oldest First)</option>
              <option value="popular">👁️ More Number of Views (Most Viewed)</option>
              <option value="most_liked">❤️ More Likes (Most Appreciated)</option>
              <option value="title_asc">🔤 Alphabetical: Invention Title (A to Z)</option>
              <option value="title_desc">🔤 Alphabetical: Invention Title (Z to A)</option>
              <option value="innovator_asc">👤 Alphabetical: Innovator Name (A to Z)</option>
              <option value="cost_asc">💰 Cost: Low to High (Budget-Friendly)</option>
              <option value="cost_desc">💎 Cost: High to Low</option>
              <option value="field_tested">🌱 Field-Tested First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main Feed Content with Staggered Cascading Reveal */}
      {loading ? (
        <LoadingSkeleton count={viewMode === 'feed' ? 3 : 6} type={viewMode === 'feed' ? 'feed' : 'card'} />
      ) : inventions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-soft max-w-xl mx-auto"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">No innovations match your specific filter.</p>
            <p className="text-xs text-slate-500 mt-1">
              Try widening your budget, clearing your keyword, or click below to restore all verified blueprints.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-soft hover:shadow-teal-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Filters & Show All Reference Innovations</span>
          </button>
        </motion.div>
      ) : viewMode === 'feed' ? (
        /* LinkedIn Single-Column Feed with Staggered Animations */
        <motion.div
          key="feed-container"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-2xl mx-auto space-y-6"
        >
          {inventions.map((inv) => (
            <motion.div key={inv.id} variants={itemVariants}>
              <InventionCard invention={inv} onUpdate={fetchInventions} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Grid View with Staggered Animations */
        <motion.div
          key="grid-container"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {inventions.map((inv) => (
            <motion.div key={inv.id} variants={itemVariants}>
              <InventionCard invention={inv} onUpdate={fetchInventions} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default DiscoverPage;
