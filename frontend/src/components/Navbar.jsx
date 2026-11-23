import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import {
  Lightbulb,
  Search,
  Compass,
  Award,
  MapPin,
  Users,
  BarChart3,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Zap,
  Menu,
  X,
  PlusCircle,
  Building2,
  ChevronDown,
  ShoppingBag,
  Handshake,
  KeyRound,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../app/AuthContext';
import { useUltraLite } from '../app/UltraLiteContext';
import { useOffline } from '../app/OfflineContext';
import DemoAccountsModal from '../features/auth/DemoAccountsModal';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isInnovator } = useAuth();
  const { ultraLite, toggleUltraLite } = useUltraLite();
  const { isOnline } = useOffline();
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Track scroll for frosted glass shadow elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const secondaryTools = [
    { name: 'Community Bounties', path: '/bounties', icon: Award, desc: 'Solve rural engineering problems' },
    { name: 'Fabrication Workshops', path: '/workshops', icon: MapPin, desc: 'Find local makerspaces & toolings' },
    { name: 'Expert Mentors', path: '/mentorship', icon: Users, desc: 'Get technical & patent guidance' },
    { name: 'Impact Analytics', path: '/analytics', icon: BarChart3, desc: 'CO₂ & water savings metrics' },
    { name: 'Grassroots IP Guide', path: '/ip-resources', icon: BookOpen, desc: 'Open hardware legal provenance' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? 'border-slate-200/90 shadow-md shadow-slate-900/5' : 'border-slate-200/50 shadow-none'
      }`}>
        {/* Offline indicator banner */}
        {!isOnline && (
          <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-medium">
            You are currently offline. Changes are saved locally and will synchronize when online.
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with micro hover lift */}
            <Link to="/" className="flex items-center gap-2.5 group transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-soft group-hover:shadow-teal-500/25 group-hover:bg-teal-700 transition-all">
                <Lightbulb className="w-5 h-5 text-amber-300 transition-transform group-hover:rotate-12" />
              </div>
              <div>
                <span className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  Rural Innovation Hub
                </span>
                <span className="hidden sm:block text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                  Showcase • Rent • Buy Hardware
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with animated hover underlines */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {/* 1. Showcase Catalog */}
              <Link
                to="/discover"
                className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive('/discover')
                    ? 'text-teal-700 font-extrabold bg-teal-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:scale-110" />
                <span>Showcase Catalog</span>
                {isActive('/discover') ? (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-teal-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                ) : (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-teal-600/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                )}
              </Link>

              {/* Investors & Pitch Directory */}
              <Link
                to="/investors"
                className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive('/investors')
                    ? 'text-teal-700 font-extrabold bg-teal-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:scale-110" />
                <span>Investors & Pitch</span>
                {isActive('/investors') ? (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-teal-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                ) : (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-teal-600/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                )}
              </Link>

              {/* 2. Role-specific primary link */}
              {user?.role === 'INVESTOR' || user?.role === 'OFFICIAL' || user?.role === 'ADMIN' ? (
                <Link
                  to="/officials"
                  className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive('/officials')
                      ? 'text-sky-700 font-extrabold bg-sky-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-600 transition-transform group-hover:scale-110" />
                  <span>Officials Portal</span>
                  {isActive('/officials') ? (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-sky-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-sky-600/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                  )}
                </Link>
              ) : isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive('/dashboard')
                      ? 'text-teal-700 font-extrabold bg-teal-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:scale-110" />
                  <span>Inventor Workspace</span>
                  {isActive('/dashboard') ? (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-teal-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-teal-600/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                  )}
                </Link>
              ) : null}

              {/* 3. Offers & Inquiries (Authenticated) */}
              {isAuthenticated && (
                <Link
                  to="/offers"
                  className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive('/offers')
                      ? 'text-teal-700 font-extrabold bg-teal-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:scale-110" />
                  <span>Offers</span>
                  {isActive('/offers') ? (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-teal-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-teal-600/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                  )}
                </Link>
              )}

              {/* 4. Chat & Messages (Authenticated) */}
              {isAuthenticated && (
                <Link
                  to="/messages"
                  className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive('/messages')
                      ? 'text-teal-700 font-extrabold bg-teal-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:scale-110" />
                  <span>Messages</span>
                  {isActive('/messages') ? (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-teal-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-teal-600/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                  )}
                </Link>
              )}

              {/* 5. More Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    toolsDropdownOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>More Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {toolsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Community Resources
                      </div>
                      {secondaryTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.path}
                            to={tool.path}
                            onClick={() => setToolsDropdownOpen(false)}
                            className={`flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors ${
                              isActive(tool.path) ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-bold leading-tight">{tool.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{tool.desc}</div>
                            </div>
                          </Link>
                        );
                      })}

                      {isAdmin && (
                        <div className="pt-2 mt-1 border-t border-slate-100">
                          <Link
                            to="/admin"
                            onClick={() => setToolsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-amber-800 hover:bg-amber-50 text-xs font-bold"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Admin Moderation Queue</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Action Buttons with smooth micro-interactions */}
            <div className="flex items-center gap-2">
              {/* Ultra-Lite Mode Toggle */}
              <button
                onClick={toggleUltraLite}
                title={ultraLite ? 'Ultra-Lite Mode active' : 'Switch to Ultra-Lite Mode (low bandwidth)'}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                  ultraLite
                    ? 'bg-teal-700 text-white border-teal-800 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${ultraLite ? 'text-amber-300 fill-amber-300' : ''}`} />
                <span className="hidden md:inline">Ultra-Lite</span>
              </button>

              {/* Demo Accounts Button */}
              <button
                onClick={() => setDemoModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs cursor-pointer"
              >
                Demo Logins
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <img
                      src={user.profile_photo_url || (user.email === 'nharivishnu31072008@gmail.com' ? '/images/avatars/harivishnu.jpg' : '/images/avatars/default.jpg')}
                      alt={user.full_name}
                      onError={(e) => { e.target.src = '/images/avatars/harivishnu.jpg'; }}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-600/30 bg-white"
                    />
                    <span className="hidden sm:inline font-bold text-xs max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                    <span className="hidden md:inline px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">
                      {user.role}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 overflow-hidden"
                      >
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
                          <img
                            src={user.profile_photo_url || (user.email === 'nharivishnu31072008@gmail.com' ? '/images/avatars/harivishnu.jpg' : '/images/avatars/default.jpg')}
                            alt={user.full_name}
                            onError={(e) => { e.target.src = '/images/avatars/harivishnu.jpg'; }}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-600 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 truncate">{user.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">
                              @{user.username || 'user'}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="inline-block px-2 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[9px] font-extrabold uppercase">
                                {user.role}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Online
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Menu Items */}
                        <div className="py-1 text-xs">
                          <Link
                            to="/profile?tab=details"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-teal-600" />
                            <span>My Profile & Details</span>
                          </Link>

                          <Link
                            to="/profile?tab=inventions"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition-colors"
                          >
                            <Wrench className="w-4 h-4 text-teal-600" />
                            <span>My Inventions & Blueprints</span>
                          </Link>

                          <Link
                            to="/profile?tab=offers"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition-colors"
                          >
                            <Handshake className="w-4 h-4 text-emerald-600" />
                            <span>Incoming Offers & Buyers</span>
                          </Link>

                          <Link
                            to="/profile?tab=settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition-colors"
                          >
                            <KeyRound className="w-4 h-4 text-amber-600" />
                            <span>Settings & 4-Digit Quick PIN</span>
                          </Link>
                        </div>

                        {/* Logout Section */}
                        <div className="pt-1 mt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Sign Out of Hub</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shimmer-btn-fx"
                  >
                    Join Hub
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <Search className="w-4 h-4 text-teal-600" />
              Showcase Catalog
            </Link>
            <Link
              to="/investors"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <Users className="w-4 h-4 text-teal-600" />
              Investors & Pitch
            </Link>
            <Link
              to="/inventions/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              Add Invention
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <ShoppingBag className="w-4 h-4 text-teal-600" />
                  Commercial Offers
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Messages
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-slate-100 font-semibold text-xs text-slate-400 px-3">
              Tools & Modules
            </div>
            {secondaryTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="w-4 h-4 text-teal-600" />
                  {tool.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Sleek 3px Scroll Reading Progress Bar */}
        {!ultraLite && (
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-sky-500 to-teal-600 origin-left z-50 pointer-events-none"
          />
        )}
      </header>

      {/* Demo Modal */}
      {demoModalOpen && <DemoAccountsModal onClose={() => setDemoModalOpen(false)} />}
    </>
  );
};

export default Navbar;
