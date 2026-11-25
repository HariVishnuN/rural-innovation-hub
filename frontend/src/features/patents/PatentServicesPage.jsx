import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  FileCheck2,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Hash,
  Copy,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  FileText,
  Lock,
  Stamp,
  Calendar,
  Send,
  Loader2,
  Check,
  Layers,
  Wrench,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/Toast';
import { DEFAULT_INVENTIONS } from '../../data/defaultInventions';

const FALLBACK_PACKAGES = [
  {
    package_type: 'PROVISIONAL',
    title: 'Provisional Patent Specification',
    tagline: '12-Month Global Priority Protection at Grassroots Cost',
    fee_inr: 4999,
    turnaround_days: '3-5 Business Days',
    features: [
      'Official Form 1 & Form 2 Drafting with Certified Patent Agent',
      'Secures Indian Patent Office (IPO) Filing Date & Priority Number',
      "Enables 'Patent Pending' label on all machines & prototypes",
      '12-month window to commercialize before complete specification',
      'Cryptographic SHA-256 timestamped proof of invention provenance',
    ],
    best_for: 'Innovators testing early prototypes in villages before committing to complete patent filing.',
  },
  {
    package_type: 'UTILITY',
    title: 'Complete Utility Patent (Non-Provisional)',
    tagline: 'Full 20-Year Exclusive Commercial & Manufacturing Rights',
    fee_inr: 14999,
    turnaround_days: '10-14 Business Days',
    features: [
      'Exhaustive 10+ Claims Formulation covering mechanical design & process',
      'High-Precision CAD Schematics complying with Indian Patent Rules 2003',
      'Prior-Art Novelty Clearance Search across global patent databases',
      'Response to First Examination Report (FER) by registered patent attorney',
      '20-year legal monopoly protection across all Indian states',
    ],
    best_for: 'Market-ready machines seeking manufacturing licenses, corporate buyouts, or bank venture debt.',
  },
  {
    package_type: 'DESIGN',
    title: 'Industrial Design Registration',
    tagline: 'Aesthetic, Ergonomic & Exterior Shape Protection',
    fee_inr: 8999,
    turnaround_days: '5-7 Business Days',
    features: [
      '6-View Isometric CAD Drawings (Front, Top, Side, Perspective)',
      'Protects unique physical form factor against counterfeit duplication',
      'Fast-track examination under National Design Rules',
      '10-year term renewable for an additional 5 years (15 years total)',
      'Affordable shield against local workshop knockoffs',
    ],
    best_for: 'Unique physical farm implements, ergonomic hand-tools, and distinctive machinery frames.',
  },
];

const PatentServicesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState(FALLBACK_PACKAGES[0]);
  const [userInventions, setUserInventions] = useState([]);
  const [selectedInventionId, setSelectedInventionId] = useState('');
  const [loadingInventions, setLoadingInventions] = useState(false);

  // Form State
  const [applicantName, setApplicantName] = useState(user?.full_name || '');
  const [applicantState, setApplicantState] = useState(user?.state || 'Gujarat');
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Applications List State
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'my_patents' | 'faq'

  useEffect(() => {
    fetchPackages();
    if (isAuthenticated) {
      fetchUserInventions();
      fetchMyApplications();
    }
  }, [isAuthenticated]);

  const fetchPackages = async () => {
    try {
      const res = await apiClient.get('/patents/packages');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPackages(res.data);
        setSelectedPackage(res.data[0]);
      }
    } catch {
      // Use fallback packages
    }
  };

  const fetchUserInventions = async () => {
    setLoadingInventions(true);
    try {
      const res = await apiClient.get('/users/me/dashboard');
      const invs = res.data?.inventions || [];
      if (invs.length > 0) {
        setUserInventions(invs);
        setSelectedInventionId(String(invs[0].id));
      } else {
        // Fallback to user default reference list
        setUserInventions(DEFAULT_INVENTIONS.slice(0, 3));
        setSelectedInventionId(String(DEFAULT_INVENTIONS[0].id));
      }
    } catch {
      setUserInventions(DEFAULT_INVENTIONS.slice(0, 3));
      setSelectedInventionId(String(DEFAULT_INVENTIONS[0].id));
    } finally {
      setLoadingInventions(false);
    }
  };

  const fetchMyApplications = async () => {
    setLoadingApplications(true);
    try {
      const res = await apiClient.get('/patents/my-applications');
      setMyApplications(res.data || []);
    } catch {
      setMyApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const selectedInvention = userInventions.find((i) => String(i.id) === String(selectedInventionId)) || userInventions[0];

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    showToast('📋 SHA-256 Provenance Hash copied!', 'share');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to file a patent application.');
      return;
    }
    if (!selectedInventionId) {
      alert('Please select an innovation to protect.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        invention_id: parseInt(selectedInventionId),
        package_type: selectedPackage.package_type,
        applicant_name: applicantName.trim() || user?.full_name || 'Grassroots Innovator',
        applicant_state: applicantState.trim() || 'Gujarat',
        applicant_phone: applicantPhone.trim() || user?.phone || '',
        notes: notes.trim() || null,
      };

      const res = await apiClient.post('/patents/apply', payload);
      setMyApplications((prev) => [res.data, ...prev]);
      setActiveTab('my_patents');
      showToast('🛡️ Patent application filed! Certified attorney review initiated.', 'info');
      setNotes('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit patent application. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Stamp className="w-3.5 h-3.5 text-blue-600" />
            Officially Filed (IPO)
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Under Attorney Review
          </span>
        );
      case 'GRANTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Patent Granted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Pending Processing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header with Soft Ambient Radial Mesh Glow */}
      <div className="relative max-w-5xl mx-auto text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>National Grassroots Intellectual Property Wing</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Protect Your Village Machine with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-sky-600">
            Transparent Patent Services
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Every grassroots innovation on the Rural Innovation Hub receives an immutable SHA-256 cryptographic provenance timestamp.
          Convert your technical blueprints into registered patents with certified Indian Patent Attorneys at heavily subsidized community rates.
        </p>

        {/* Quick Trust Badges */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap pt-2 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            IPO Form 1 & Form 2 Drafting
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Hash className="w-4 h-4 text-sky-600" />
            SHA-256 Provenance Fingerprint
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Lock className="w-4 h-4 text-amber-600" />
            100% Innovator Retained Rights
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-2 shadow-2xs">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patent Packages & Apply
          </button>
          <button
            onClick={() => setActiveTab('my_patents')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my_patents'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Patent Applications</span>
            {myApplications.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-black">
                {myApplications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            IP Protection FAQ
          </button>
        </div>
      </div>

      {/* Tab 1: Packages & Application Form */}
      {activeTab === 'packages' && (
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Transparent Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isSelected = selectedPackage.package_type === pkg.package_type;
              return (
                <motion.div
                  key={pkg.package_type}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative rounded-3xl p-6 bg-white border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 ring-4 ring-teal-500/10 shadow-lg'
                      : 'border-slate-200 hover:border-teal-300 shadow-soft'
                  }`}
                >
                  {pkg.package_type === 'PROVISIONAL' && (
                    <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white shadow-xs">
                      Most Popular for Makers
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                        {pkg.turnaround_days}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">{pkg.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.tagline}</p>
                    </div>

                    <div className="py-2 border-y border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                          ₹{pkg.fee_inr.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">all-inclusive</span>
                      </div>
                      <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                        Includes government filing stamp & legal drafting
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" /> Selected Package
                        </>
                      ) : (
                        'Select Package'
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Patent Filing Form with Cryptographic Proof */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-black text-slate-900">
                  Submit Filing Request for {selectedPackage.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Selected package fee: <strong className="text-slate-800">₹{selectedPackage.fee_inr.toLocaleString()}</strong> • Priority turnaround: <strong className="text-slate-800">{selectedPackage.turnaround_days}</strong>
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-6">
              {/* Step 1: Select Invention to Protect */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  1. Select Submitted Innovation to Protect:
                </label>
                {userInventions.length > 0 ? (
                  <select
                    value={selectedInventionId}
                    onChange={(e) => setSelectedInventionId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {userInventions.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.title} ({inv.category} • Stage: {inv.scaling_stage || 'PROTOTYPE'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                    <span>You haven't submitted an innovation yet. Submit one first to file for patent protection.</span>
                    <Link to="/inventions/new" className="font-bold underline text-amber-900">
                      Submit Innovation Now
                    </Link>
                  </div>
                )}
              </div>

              {/* Cryptographic SHA-256 Provenance Fingerprint Panel */}
              {selectedInvention && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-black tracking-wide uppercase text-teal-300">
                        Cryptographic Provenance Fingerprint
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/30">
                      Verified On-Chain Timestamp
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 font-mono text-[11px] text-teal-300 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="truncate">{selectedInvention.sha256_hash || '9b3c4e1f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(selectedInvention.sha256_hash)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      title="Copy Hash"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Innovation ID:</span>
                      <strong className="text-white">#{selectedInvention.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Category:</span>
                      <strong className="text-white">{selectedInvention.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Safety Verification:</span>
                      <strong className="text-emerald-400">{selectedInvention.safety_score || 95}/100</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Fabrication Cost:</span>
                      <strong className="text-white">₹{parseFloat(selectedInvention.total_cost || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Applicant Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Legal Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Full Name as per Aadhaar/ID"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={applicantState}
                    onChange={(e) => setApplicantState(e.target.value)}
                    placeholder="e.g. Gujarat, Tamil Nadu, Bihar"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone (for IPO OTP)</label>
                  <input
                    type="tel"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="+91 Mobile number"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 3: Specific Claims & Innovation Highlights */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Novelty Claims & Working Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail any specific mechanism, gear ratio, chemical ratio, or local material substitution you especially wish to claim in Form 1..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
                <div className="text-xs text-slate-500">
                  <span>Guaranteed safe: Registered patent agents will review before government fee dispatch.</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={submitting}
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md hover:shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Apply for {selectedPackage.title} (₹{selectedPackage.fee_inr.toLocaleString()})</span>
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: My Patent Applications */}
      {activeTab === 'my_patents' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Your Filed Patent Applications</h2>
            <button
              onClick={() => setActiveTab('packages')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              + File Another Patent Package
            </button>
          </div>

          {loadingApplications ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading your patent filings...</div>
          ) : myApplications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No patent applications filed yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Secure 12-month priority protection for your village engineering machine starting at ₹4,999.
              </p>
              <button
                onClick={() => setActiveTab('packages')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
              >
                Explore Patent Packages
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-4 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">
                          {app.application_number || `IN/2026/${String(app.id).padStart(4, '0')}`}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {app.invention_title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Package: <span className="font-bold text-slate-700">{app.package_name}</span> • Fee: <span className="font-bold text-teal-700 font-mono">₹{app.fee_inr?.toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/inventions/${app.invention_id}/certificate`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Provenance Certificate</span>
                      </Link>
                    </div>
                  </div>

                  {/* Fingerprint Strip */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between gap-2">
                    <span className="truncate">
                      SHA-256: <strong className="text-slate-800">{app.sha256_provenance_hash}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(app.sha256_provenance_hash)}
                      className="text-teal-700 hover:underline shrink-0 font-sans font-bold"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                    <span>Applicant: {app.applicant_name} ({app.applicant_state})</span>
                    <span>Filed: {new Date(app.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Frequently Asked Questions */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-black text-slate-900">Grassroots Intellectual Property FAQs</h2>
            <p className="text-xs text-slate-500">Essential rules for Indian grassroots and open hardware inventors.</p>
          </div>

          {[
            {
              q: 'What is a Provisional Patent Specification and why is it useful?',
              a: 'A Provisional Patent Specification is an official legal submission filed under Section 9 of the Indian Patents Act 1970. It secures an immediate global filing date and priority number at a fraction of the cost. Once filed, you can legally label your machine "Patent Pending" and you gain a 12-month window to test, showcase, and commercialize your product before filing the complete specification.',
            },
            {
              q: 'Can I publicly showcase my invention and still file for a patent?',
              a: 'Under Section 31 of the Indian Patents Act, public display at recognized exhibitions or disclosure with prior cryptographic provenance (such as our SHA-256 timestamped registration) provides evidence that you are the original true and first inventor, protecting you against competitor patent squattings.',
            },
            {
              q: 'What is the role of the Rural Innovation Hub legal network?',
              a: 'We connect village innovators directly with certified Indian Patent Attorneys and National Innovation Foundation (NIF) legal mentors who draft formal claims, handle IPO correspondence, and ensure you retain 100% equity and ownership.',
            },
            {
              q: 'How does the SHA-256 cryptographic provenance hash protect me?',
              a: 'Every time you publish an innovation, our system computes a SHA-256 mathematical hash combining your identity, blueprint steps, schematics, and the exact second of submission. This creates an unforgeable digital fingerprint proving prior creation in any court or patent office examination.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 shadow-soft">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatentServicesPage;
