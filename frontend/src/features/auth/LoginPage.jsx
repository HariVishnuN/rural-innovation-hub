import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  Wrench,
  Building2,
  CheckCircle2,
  Sparkles,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Cpu,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { useUltraLite } from '../../app/UltraLiteContext';
import { Button } from '../../components/Button';
import DemoAccountsModal from './DemoAccountsModal';

const LoginPage = () => {
  const { ultraLite } = useUltraLite();
  const [selectedPortal, setSelectedPortal] = useState('innovator'); // 'innovator' | 'official'
  const [authMode, setAuthMode] = useState('pin'); // 'pin' | 'password'

  // PIN Login State
  const [pinUsername, setPinUsername] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const { login, loginWithPin } = useAuth();
  const navigate = useNavigate();

  // Parallax subtle float
  const { scrollY } = useScroll();
  const floatBg1 = useTransform(scrollY, [0, 400], [0, 20]);
  const floatBg2 = useTransform(scrollY, [0, 400], [0, -25]);

  const handlePortalSwitch = (portal) => {
    setSelectedPortal(portal);
    setError('');
  };

  const handlePinDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newDigits = [...pinDigits];
      newDigits[index] = '';
      setPinDigits(newDigits);
      return;
    }

    const char = cleanVal.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);

    if (index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setPinDigits(newDigits);

    const focusIdx = Math.min(pasted.length, 3);
    pinRefs[focusIdx].current?.focus();
  };

  const formatErrorMessage = (err) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
    }
    if (typeof detail === 'string') return detail;
    return 'Invalid credentials. Please verify your username / email and PIN / password.';
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pin = pinDigits.join('');
    if (!pinUsername.trim()) {
      setError('Please enter your username or registered email.');
      return;
    }
    if (pin.length !== 4) {
      setError('Please enter your complete 4-digit numeric PIN.');
      return;
    }

    setLoading(true);
    try {
      const userData = await loginWithPin(pinUsername.trim(), pin);
      if (userData.role === 'INNOVATOR') {
        navigate('/dashboard');
      } else {
        navigate('/officials');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email.trim(), password);
      if (userData.role === 'INNOVATOR') {
        navigate('/dashboard');
      } else {
        navigate('/officials');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      if (role === 'INNOVATOR') {
        await loginWithPin('ramesh', '1234');
        navigate('/dashboard');
      } else {
        await loginWithPin('ananya', '1234');
        navigate('/officials');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center space-y-8">
      {/* Background Parallax Subtle Orbs */}
      {!ultraLite && (
        <>
          <motion.div
            style={{ y: floatBg1 }}
            className="absolute -top-10 left-10 w-48 h-48 rounded-full bg-teal-100/40 blur-3xl pointer-events-none -z-10"
          />
          <motion.div
            style={{ y: floatBg2 }}
            className="absolute top-40 right-10 w-60 h-60 rounded-full bg-sky-100/40 blur-3xl pointer-events-none -z-10"
          />
        </>
      )}

      {/* Page Title with Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin-slow" />
          <span>Role-Based Access • Quick PIN or Password Login</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Select Your Portal to Continue
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Grassroots innovators showcase hardware inventions, and Officials (Investors, Government, and Enterprises) view, rent, or buy them.
        </p>
      </motion.div>

      {/* Two Clear Portals Selection with Interactive 3D Spring Lift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portal 1: Grassroots Inventor */}
        <motion.div
          whileHover={ultraLite ? undefined : { y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={() => handlePortalSwitch('innovator')}
          className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            selectedPortal === 'innovator'
              ? 'border-teal-600 bg-white shadow-soft ring-2 ring-teal-600/20'
              : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                <Wrench className="w-6 h-6 text-teal-700" />
              </div>
              {selectedPortal === 'innovator' && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-600 text-white shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected Portal
                </motion.span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 block">
                Portal 1 • Rural Innovators
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Inventor Workspace
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Upload your inventions, share blueprints & sketches, protect your grassroots IP with SHA-256 fingerprints, and review incoming Rent or Buy offers from Officials.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickDemoLogin('INNOVATOR');
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer shimmer-btn-fx"
            >
              <UserCheck className="w-4 h-4" />
              <span>Demo: Inventor Login (ramesh • PIN: 1234)</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Portal 2: Officials & Investors */}
        <motion.div
          whileHover={ultraLite ? undefined : { y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={() => handlePortalSwitch('official')}
          className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            selectedPortal === 'official'
              ? 'border-sky-600 bg-white shadow-soft ring-2 ring-sky-600/20'
              : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-xs">
                <Building2 className="w-6 h-6 text-sky-700" />
              </div>
              {selectedPortal === 'official' && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-600 text-white shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected Portal
                </motion.span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 block">
                Portal 2 • Officials & Investors
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Officials Management & Showcase
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Inspect vetted innovations with one-click filtering, evaluate bill of materials costs, and submit direct Buy, Rent, or Licensing offers for state-wide deployment.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickDemoLogin('OFFICIAL');
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer shimmer-btn-fx"
            >
              <UserCheck className="w-4 h-4" />
              <span>Demo: Officials Login (ananya • PIN: 1234)</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Main Login Card: Two Tabs (Quick PIN vs. Email & Password) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="max-w-md w-full mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-md transition-shadow space-y-6"
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Sign In to Your Account
            </h3>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {selectedPortal === 'innovator' ? 'Inventor Portal' : 'Officials Portal'}
            </span>
          </div>

          {/* Animated Tab Switcher: Quick PIN vs Email/Password */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200/60">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'pin'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick PIN Login</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'password'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>Email & Password</span>
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </motion.div>
        )}

        {/* TAB 1: QUICK PIN LOGIN */}
        {authMode === 'pin' && (
          <form className="space-y-4" onSubmit={handlePinSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username or Registered Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={pinUsername}
                  onChange={(e) => setPinUsername(e.target.value)}
                  placeholder="e.g. ramesh or user@example.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  4-Digit Quick PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPin ? 'Hide PIN' : 'Show PIN'}</span>
                </button>
              </div>

              {/* 4-Box PIN Input with Spring Focus Scale */}
              <div className="flex items-center justify-center gap-3 py-1" onPaste={handlePinPaste}>
                {pinDigits.map((digit, idx) => (
                  <motion.input
                    key={idx}
                    ref={pinRefs[idx]}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    whileFocus={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    onChange={(e) => handlePinDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    className="w-12 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-slate-50 transition-all"
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-1.5">
                Tip: Demo accounts PIN is <span className="font-bold text-slate-700">1234</span>
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold text-xs py-2.5 shadow-sm"
              isLoading={loading}
            >
              Sign In with 4-Digit PIN
            </Button>
          </form>
        )}

        {/* TAB 2: EMAIL & PASSWORD LOGIN */}
        {authMode === 'password' && (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold text-xs py-2.5 shadow-sm"
              isLoading={loading}
            >
              Sign In with Password
            </Button>
          </form>
        )}

        {/* Footer Links */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setDemoOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Browse All 4 Persona Accounts & PINs
          </motion.button>

          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>

      {demoOpen && <DemoAccountsModal onClose={() => setDemoOpen(false)} />}
    </div>
  );
};

export default LoginPage;
