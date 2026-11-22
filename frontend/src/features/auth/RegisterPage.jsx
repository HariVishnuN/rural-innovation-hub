import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Lock,
  Mail,
  User,
  MapPin,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Building2,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import apiClient from '../../api/client';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1 = Details, 2 = 6-Box OTP Verification

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    pin: '',
    role: 'INNOVATOR', // INNOVATOR | INVESTOR | MENTOR
    phone: '',
    village_city: '',
    district: '',
    state: 'Gujarat',
    pincode: '',
    preferred_language: 'English',
    bio: '',
    skills_expertise: '',
    consent_given: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  const { verifyOtpAndRegister } = useAuth();
  const navigate = useNavigate();

  const statesOfIndia = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const formatErrorMessage = (err) => {
    if (!err) return 'Operation failed. Please verify your information.';
    if (!err.response) {
      if (err.message && err.message.toLowerCase().includes('network')) {
        return 'Cannot connect to backend server at http://127.0.0.1:8000. Please ensure the backend is running.';
      }
      return err.message || 'Unable to connect to the server.';
    }

    const { data, status } = err.response;
    const detail = data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : '';
          const msg = d.msg || 'Invalid input';
          return field ? `${field}: ${msg}` : msg;
        })
        .join('; ');
    }

    if (typeof detail === 'string') {
      return detail;
    }

    if (status === 409) {
      return 'An account with this email or username already exists. Please sign in or use another username.';
    }

    if (status === 422) {
      return 'Validation error. Please verify full name, username format, and password length.';
    }

    return `Server error (${status}). Please try again.`;
  };

  // Step 1: Request OTP
  const handleProceedToOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim()) {
      setError('Full legal name is required.');
      return;
    }
    if (!formData.username.trim() || formData.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Valid email address is required.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!formData.pin || !/^\d{4}$/.test(formData.pin)) {
      setError('4-Digit Quick PIN must be exactly 4 numeric digits.');
      return;
    }
    if (!formData.consent_given) {
      setError('You must accept the Open Hardware charter consent to register.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/send-otp', {
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      });

      if (res.data?.dev_otp) {
        setDevOtp(res.data.dev_otp);
        const chars = String(res.data.dev_otp).split('').slice(0, 6);
        while (chars.length < 6) chars.push('');
        setOtpDigits(chars);
      }

      setStep(2);
      setResendTimer(45);
      setCanResend(false);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/send-otp', {
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      });

      if (res.data?.dev_otp) {
        setDevOtp(res.data.dev_otp);
        const chars = String(res.data.dev_otp).split('').slice(0, 6);
        while (chars.length < 6) chars.push('');
        setOtpDigits(chars);
      }

      setResendTimer(45);
      setCanResend(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // OTP Digit Change Handler
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const chars = pasteData.split('');
      setOtpDigits(chars);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP and Register User
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userData = await verifyOtpAndRegister(
        {
          ...formData,
          full_name: formData.full_name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          pin: formData.pin.trim(),
          phone_number: formData.phone,
          village_or_city: formData.village_city,
          skills_or_expertise: formData.skills_expertise,
          consent_accepted: formData.consent_given,
        },
        otpCode
      );

      if (userData.role === 'INVESTOR' || userData.role === 'OFFICIAL' || userData.role === 'ADMIN') {
        navigate('/officials');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft hover:shadow-md transition-shadow"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white mx-auto shadow-sm"
          >
            <Lightbulb className="w-6 h-6 text-amber-300" />
          </motion.div>
          <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Join the Rural Innovation Hub' : 'Verify Your Email Address'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {step === 1
              ? 'Publish open blueprints, pledge grants, or discover village-built agricultural machines.'
              : `We sent a 6-digit verification code to ${formData.email}`}
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${step === 1 ? 'bg-teal-100 text-teal-800 border border-teal-300 shadow-2xs' : 'bg-slate-100 text-slate-600'}`}>
              <span>1</span>
              <span>Account Credentials</span>
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${step === 2 ? 'bg-teal-100 text-teal-800 border border-teal-300 shadow-2xs' : 'bg-slate-100 text-slate-400'}`}>
              <span>2</span>
              <span>Email OTP Verification</span>
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-2xs"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold leading-relaxed">{error}</div>
              {error.toLowerCase().includes('already exists') && (
                <div className="pt-1.5 flex items-center gap-2">
                  <span className="text-slate-600">Already registered?</span>
                  <Link
                    to="/login"
                    className="font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2"
                  >
                    Sign in to your account &rarr;
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 1: ACCOUNT CREDENTIALS FORM */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step-1-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleProceedToOtp}
              className="space-y-5"
            >
              {/* Role Selection with Animated Spring Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">I am joining as:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'INNOVATOR', title: 'Grassroots Innovator', sub: 'I build & submit inventions', icon: Wrench },
                    { id: 'INVESTOR', title: 'Investor / Official', sub: 'I view, rent & buy hardware', icon: Building2 },
                    { id: 'MENTOR', title: 'Technical Mentor', sub: 'I advise on engineering & IP', icon: Sparkles },
                  ].map((roleOption) => {
                    const Icon = roleOption.icon;
                    const isSelected = formData.role === roleOption.id;
                    return (
                      <motion.div
                        key={roleOption.id}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        onClick={() => setFormData({ ...formData, role: roleOption.id })}
                        className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/80 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <div className="text-xs font-black">{roleOption.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{roleOption.sub}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Choose Username (for Fast PIN Login) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">@</span>
                    <input
                      type="text"
                      required
                      pattern="^[a-zA-Z0-9_\.]{3,30}$"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      placeholder="ramesh_patel"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">3-30 letters, numbers, or underscores</span>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (for Verification) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Password & 4-Digit Quick PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password (min 6 characters) *</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Set 4-Digit Quick PIN *</label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[10px] text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      {showPin ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={4}
                      pattern="^[0-9]{4}$"
                      inputMode="numeric"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                      placeholder="1234"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-widest text-center transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Strictly 4 digits (e.g. 1234)</span>
                </div>
              </div>

              {/* Region / State & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State / Region</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
                    >
                      {statesOfIndia.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="consent_given"
                  required
                  checked={formData.consent_given}
                  onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="consent_given" className="text-xs text-slate-600 leading-snug cursor-pointer">
                  I agree to the <span className="font-bold text-slate-800">Open Hardware Charter</span> and consent to
                  publishing verified frugal engineering blueprints with tamper-proof SHA-256 provenance timestamps.
                </label>
              </div>

              {/* Submit Button to Step 2 with Spring & Shimmer */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shimmer-btn-fx"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue & Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* STEP 2: 6-BOX OTP VERIFICATION SCREEN */}
          {step === 2 && (
            <motion.form
              key="step-2-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifyOtpSubmit}
              className="space-y-6"
            >
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-600">Verification Email: </span>
                  <span className="font-mono font-bold text-teal-800">{formData.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Dev / Demo Helper Banner */}
              {devOtp && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>Demo / Offline Mode:</strong> Your 6-digit code is{' '}
                      <span className="font-mono font-black text-amber-950 text-sm tracking-wider px-1.5 py-0.5 bg-amber-100 rounded">
                        {devOtp}
                      </span>
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      const chars = String(devOtp).split('').slice(0, 6);
                      setOtpDigits(chars);
                    }}
                    className="px-2 py-1 rounded-md bg-amber-200/80 hover:bg-amber-300 font-bold text-[10px] text-amber-950 cursor-pointer"
                  >
                    Auto-Fill
                  </motion.button>
                </div>
              )}

              {/* 6 OTP Input Boxes with Spring Focus */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 mb-3">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <motion.input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      whileFocus={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-black rounded-xl border-2 border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 bg-white shadow-xs focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Code Section */}
              <div className="text-center text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Verification Code</span>
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">
                    Resend code in <strong className="font-mono text-slate-700">{resendTimer}s</strong>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shimmer-btn-fx"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code & Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Verify Code & Complete Registration</span>
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Details
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Existing Account Footer Link */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          Already registered on Rural Innovation Hub?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:text-teal-800">
            Sign In with Password or Quick PIN &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
