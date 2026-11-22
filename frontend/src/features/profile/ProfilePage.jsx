import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Wrench,
  Shield,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  PlusCircle,
  ShoppingBag,
  Handshake,
  Heart,
  MessageCircle,
  DollarSign,
  Calendar,
  ExternalLink,
  MessageSquare,
  Lock,
  ArrowRight,
  Camera,
  Upload,
  Globe,
  Building,
  Key,
  Check,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import apiClient from '../../api/client';
import { Card, Button, Badge } from '../../components/Button';
import { getScalingStageBadge } from '../inventions/InventionCard';

const PRESET_AVATARS = [
  { name: 'Hari Vishnu (You)', url: '/images/avatars/harivishnu.jpg' },
  { name: 'Ramesh Patel', url: '/images/avatars/ramesh.jpg' },
  { name: 'Kavita Devi', url: '/images/avatars/kavita.jpg' },
  { name: 'Suresh Kumar', url: '/images/avatars/suresh.jpg' },
  { name: 'Ananya Sengupta', url: '/images/avatars/ananya.jpg' },
  { name: 'Vikram Deshmukh', url: '/images/avatars/vikram.jpg' },
  { name: 'Dr. Anita Roy', url: '/images/avatars/anita.jpg' },
  { name: 'Prof. Rajesh Sharma', url: '/images/avatars/rajesh.jpg' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'हिन्दी (Hindi)' },
  { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)' },
  { code: 'Bengali', label: 'বাংলা (Bengali)' },
  { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Malayalam', label: 'മലയാളം (Malayalam)' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab state synced with URL ?tab=...
  const [activeTab, setActiveTab] = useState(
    queryTab === 'buyers' || queryTab === 'offers' ? 'offers' :
    queryTab === 'details' ? 'details' :
    queryTab === 'settings' ? 'settings' : 'details'
  );

  useEffect(() => {
    if (queryTab) {
      const mapped = queryTab === 'buyers' ? 'offers' : queryTab;
      if (['inventions', 'offers', 'details', 'settings'].includes(mapped)) {
        setActiveTab(mapped);
      }
    }
  }, [queryTab]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Personal details form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    preferred_language: 'English',
    village_city: '',
    district: '',
    state: '',
    pincode: '',
    organization_college: '',
    skills_expertise: '',
    bio: '',
  });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState('');

  // Profile photo upload & presets state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  // Quick PIN & Password Settings State
  const [pinUsername, setPinUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ text: '', type: '' });

  // Status update loading state for buyer offers
  const [updatingOfferId, setUpdatingOfferId] = useState(null);

  // Deletion modal & loading state for inventions
  const [inventionToDelete, setInventionToDelete] = useState(null);
  const [deletingInvention, setDeletingInvention] = useState(false);

  const handleDeleteInvention = async () => {
    if (!inventionToDelete) return;
    setDeletingInvention(true);
    try {
      await apiClient.delete(`/inventions/${inventionToDelete.id}`);
      setDashboardData((prev) => ({
        ...prev,
        inventions: (prev.inventions || []).filter((i) => i.id !== inventionToDelete.id),
        summary: {
          ...prev.summary,
          total_inventions: Math.max(0, (prev.summary?.total_inventions || 1) - 1),
        },
      }));
      setDetailsSuccess(`Invention "${inventionToDelete.title}" was successfully deleted.`);
      setInventionToDelete(null);
      setTimeout(() => setDetailsSuccess(''), 4500);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete innovation. Please try again.');
    } finally {
      setDeletingInvention(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users/me/dashboard');
      setDashboardData(res.data);
      const u = res.data.user;
      setFormData({
        full_name: u.full_name || '',
        phone: u.phone || '',
        preferred_language: u.preferred_language || 'English',
        village_city: u.village_city || '',
        district: u.district || '',
        state: u.state || '',
        pincode: u.pincode || '',
        organization_college: u.organization_college || '',
        bio: u.bio || '',
        skills_expertise: u.skills_expertise || '',
      });
      setPinUsername(u.username || '');
    } catch (e) {
      console.warn('Failed to load innovator dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  // Upload custom photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const uploadRes = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = uploadRes.data.url;

      // Update in MySQL via user PATCH endpoint
      const patchRes = await apiClient.patch('/users/me', {
        profile_photo_url: uploadedUrl,
      });

      setDashboardData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          profile_photo_url: uploadedUrl,
        },
      }));

      // Update globally across navbar
      if (updateUser) {
        updateUser({ profile_photo_url: uploadedUrl });
      }

      setDetailsSuccess('Profile picture updated successfully!');
      setTimeout(() => setDetailsSuccess(''), 4000);
    } catch (err) {
      alert('Failed to upload photo. Please select a valid PNG or JPG file.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Choose preset avatar
  const handleSelectPresetAvatar = async (avatarUrl) => {
    setUploadingPhoto(true);
    try {
      await apiClient.patch('/users/me', {
        profile_photo_url: avatarUrl,
      });

      setDashboardData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          profile_photo_url: avatarUrl,
        },
      }));

      if (updateUser) {
        updateUser({ profile_photo_url: avatarUrl });
      }

      setShowAvatarPresets(false);
      setDetailsSuccess('Profile photo updated successfully!');
      setTimeout(() => setDetailsSuccess(''), 4000);
    } catch (e) {
      alert('Failed to set avatar.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Update Personal Details & Language
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    setDetailsSuccess('');
    try {
      const res = await apiClient.patch('/users/me', formData);
      setDashboardData((prev) => ({
        ...prev,
        user: res.data,
      }));

      if (updateUser) {
        updateUser(res.data);
      }

      setDetailsSuccess('Profile details & preferred language updated successfully in MySQL!');
      setTimeout(() => setDetailsSuccess(''), 5000);
    } catch (e) {
      alert('Failed to update profile details.');
    } finally {
      setSavingDetails(false);
    }
  };

  // Update Security, Username & PIN
  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setSecurityMessage({ text: '', type: '' });

    if (!pinUsername.trim() || pinUsername.trim().length < 3) {
      setSecurityMessage({ text: 'Username must be at least 3 characters.', type: 'error' });
      return;
    }

    if (newPin && !/^\d{4}$/.test(newPin)) {
      setSecurityMessage({ text: 'PIN must be strictly 4 numeric digits (0000-9999).', type: 'error' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setSecurityMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityMessage({ text: 'New passwords do not match.', type: 'error' });
        return;
      }
    }

    setSecuritySaving(true);
    try {
      const payload = { username: pinUsername.trim().toLowerCase() };
      if (newPin) payload.pin = newPin;
      if (newPassword) payload.new_password = newPassword;

      const res = await apiClient.patch('/users/me', payload);

      if (updateUser) {
        updateUser(res.data);
      }

      setSecurityMessage({
        text: 'Security settings, username & credentials updated successfully!',
        type: 'success',
      });
      setNewPin('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecurityMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to update security credentials.';
      setSecurityMessage({ text: detail, type: 'error' });
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleUpdateOfferStatus = async (offerId, newStatus) => {
    setUpdatingOfferId(offerId);
    try {
      await apiClient.patch(`/offers/${offerId}/status`, {
        status: newStatus,
      });

      setDashboardData((prev) => {
        const updatedBuyers = prev.buyers.map((b) => (b.id === offerId ? { ...b, status: newStatus } : b));
        return {
          ...prev,
          buyers: updatedBuyers,
        };
      });
    } catch (err) {
      alert('Failed to update offer status. Please try again.');
    } finally {
      setUpdatingOfferId(null);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-slate-500 space-y-3">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-slate-700">Loading your profile workspace...</p>
      </div>
    );
  }

  const { user: profile, inventions = [], buyers = [], summary = {} } = dashboardData;

  // Active profile photo
  const currentPhoto = profile.profile_photo_url || '/images/avatars/harivishnu.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ============================================================== */}
      {/* 1. TOP PROFILE HERO BANNER                                     */}
      {/* ============================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Real Portrait with Animated Ring & Upload Button */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl ring-4 ring-teal-500/30 overflow-hidden shadow-md bg-slate-100 flex items-center justify-center">
                <img
                  src={currentPhoto}
                  alt={profile.full_name}
                  onError={(e) => { e.target.src = '/images/avatars/harivishnu.jpg'; }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hover Overlay Button to Upload */}
              <label
                htmlFor="avatar-upload-input"
                className="absolute inset-0 bg-slate-900/65 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                title="Upload custom portrait photo"
              >
                <Camera className="w-5 h-5 mb-0.5 text-amber-300" />
                <span>{uploadingPhoto ? '...' : 'Change Photo'}</span>
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />

              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white text-[10px] font-black"
                title="Active Grassroots Innovator"
              >
                ✓
              </div>
            </div>

            {/* Name, Roles, Language & Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-200/60 shadow-2xs">
                  {profile.role}
                </span>
                {profile.username && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                    @{profile.username}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                  <Globe className="w-3 h-3 text-teal-600" />
                  <span>{profile.preferred_language || 'English'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap pt-0.5">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {profile.village_city || 'Rural Region'}, {profile.state || 'India'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                {profile.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {profile.phone}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            <label
              htmlFor="avatar-upload-input"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Camera className="w-4 h-4 text-teal-600" />
              <span>{uploadingPhoto ? 'Uploading Photo...' : 'Upload Portrait'}</span>
            </label>

            <Link
              to="/inventions/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ Showcase New Invention</span>
            </Link>
          </div>
        </div>

        {/* Success Alert Banner */}
        {detailsSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{detailsSuccess}</span>
          </div>
        )}
      </motion.div>

      {/* ============================================================== */}
      {/* 2. OVERVIEW STATS STRIP (4 CLEAN CARDS)                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Inventions */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>My Inventions</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{summary.total_inventions || 0}</div>
          <div className="text-[11px] text-slate-400">Active in public showcase</div>
        </div>

        {/* Card 2: Total Likes */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Likes Received</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Heart className="w-4 h-4 fill-red-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{summary.total_likes || 0}</div>
          <div className="text-[11px] text-slate-400">Community appreciation</div>
        </div>

        {/* Card 3: Paid Reuses & Buyers */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Paid Reuses & Buyers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{summary.total_paid_reuses || 0}</div>
          <div className="text-[11px] text-slate-400">Paid adoptions & rentals</div>
        </div>

        {/* Card 4: Total Offers / Earnings */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Offers & Earnings (₹)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            ₹{parseFloat(summary.total_earnings_inr || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Committed & paid value</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TAB NAVIGATION (ALL PROFILE MANAGEMENT OPTIONS)              */}
      {/* ============================================================== */}
      <div className="border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-2xs">
        <nav className="flex space-x-1.5 text-xs font-bold overflow-x-auto relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => switchTab('details')}
            className={`relative py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap z-10 cursor-pointer ${
              activeTab === 'details'
                ? 'text-teal-900 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {activeTab === 'details' && (
              <motion.div
                layoutId="profileActiveTabIndicator"
                className="absolute inset-0 bg-teal-50 border border-teal-200/90 rounded-xl -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <User className={`w-4 h-4 ${activeTab === 'details' ? 'text-teal-700' : 'text-slate-400'}`} />
            <span>Personal Details & Language</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => switchTab('settings')}
            className={`relative py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap z-10 cursor-pointer ${
              activeTab === 'settings'
                ? 'text-teal-900 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="profileActiveTabIndicator"
                className="absolute inset-0 bg-teal-50 border border-teal-200/90 rounded-xl -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <KeyRound className={`w-4 h-4 ${activeTab === 'settings' ? 'text-teal-700' : 'text-slate-400'}`} />
            <span>Security, Username & Quick PIN</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => switchTab('inventions')}
            className={`relative py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap z-10 cursor-pointer ${
              activeTab === 'inventions'
                ? 'text-teal-900 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {activeTab === 'inventions' && (
              <motion.div
                layoutId="profileActiveTabIndicator"
                className="absolute inset-0 bg-teal-50 border border-teal-200/90 rounded-xl -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <Wrench className={`w-4 h-4 ${activeTab === 'inventions' ? 'text-teal-700' : 'text-slate-400'}`} />
            <span>My Inventions & Blueprints</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'inventions' ? 'bg-teal-200/70 text-teal-900 font-extrabold' : 'bg-slate-100 text-slate-700'}`}>
              {inventions.length}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => switchTab('offers')}
            className={`relative py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap z-10 cursor-pointer ${
              activeTab === 'offers'
                ? 'text-teal-900 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {activeTab === 'offers' && (
              <motion.div
                layoutId="profileActiveTabIndicator"
                className="absolute inset-0 bg-teal-50 border border-teal-200/90 rounded-xl -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <Handshake className={`w-4 h-4 ${activeTab === 'offers' ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span>Buyers & Paid Offers</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              {buyers.length}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase font-black tracking-wide">
              Private
            </span>
          </motion.button>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PERSONAL DETAILS & REGIONAL LANGUAGE                     */}
      {/* ============================================================== */}
      {activeTab === 'details' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft space-y-6"
        >
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <span>Personal Profile, Region & Language Preferences</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your identification, location, regional language, and craft expertise. All changes are stored directly in MySQL.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6 text-xs">
            {/* Section A: Core Identity */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-1">
                1. Basic Identity & Regional Language
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Email</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Language *</label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section B: Location & Origin */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-1">
                2. Regional Location & Origin
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village / Town / City *</label>
                  <input
                    type="text"
                    value={formData.village_city}
                    onChange={(e) => setFormData({ ...formData, village_city: e.target.value })}
                    placeholder="e.g. Dharmaj"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Anand"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 388430"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / College / Farmers Cooperative</label>
                  <input
                    type="text"
                    value={formData.organization_college}
                    onChange={(e) => setFormData({ ...formData, organization_college: e.target.value })}
                    placeholder="e.g. Anand Farmers Cooperative Society"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Skills & Craft */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-1">
                3. Craft Expertise & Biography
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Craft & Engineering Skills</label>
                <input
                  type="text"
                  value={formData.skills_expertise}
                  onChange={(e) => setFormData({ ...formData, skills_expertise: e.target.value })}
                  placeholder="e.g. Arc Welding, Solar PV, Drip Micro-irrigation, Blacksmithing, Lathe Operations"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Craft Bio / Maker Background</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief story of your grassroots engineering journey, materials you work with, and community impact..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={savingDetails}
                className="px-6 py-2.5 font-bold shadow-sm"
              >
                Save Details & Language
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SECURITY, USERNAME & 4-DIGIT QUICK PIN                   */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Credentials & Quick PIN</h2>
              <p className="text-xs text-slate-500">Configure your unique @username, 4-digit fast numeric PIN, and password.</p>
            </div>
          </div>

          {securityMessage.text && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                securityMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {securityMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{securityMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateSecurity} className="space-y-5 text-xs">
            {/* Username */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Unique Username *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">@</span>
                <input
                  type="text"
                  required
                  value={pinUsername}
                  onChange={(e) => setPinUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\.]/g, ''))}
                  placeholder="hxrivxnu"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Used for 4-digit PIN quick sign-in without typing your email.</p>
            </div>

            {/* Quick PIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Set 4-Digit Quick PIN</label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-teal-700 font-semibold hover:underline"
                >
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-3 py-2.5 text-center text-lg tracking-widest font-mono font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Leave empty to keep your existing PIN unchanged.</span>
            </div>

            {/* Password Change */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Change Account Password (Optional)</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-teal-700 font-semibold hover:underline"
                >
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 block">Leave blank if you don't wish to change your password.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-2.5 font-bold shadow-xs"
              isLoading={securitySaving}
            >
              Save Credentials & Quick PIN
            </Button>
          </form>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MY INVENTIONS & BLUEPRINTS                              */}
      {/* ============================================================== */}
      {activeTab === 'inventions' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Published Innovations ({inventions.length})</h2>
            <Link
              to="/inventions/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Another Invention</span>
            </Link>
          </div>

          {inventions.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-md p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No inventions posted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your working hardware blueprint, field-test data, and fabrication steps for officials and companies to view and buy.
              </p>
              <Link
                to="/inventions/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <span>Upload First Invention</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventions.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={inv.image_url || '/images/inventions/solar-drip.svg'}
                        alt={inv.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-xs">
                          {inv.category}
                        </span>
                        {getScalingStageBadge(inv.scaling_stage)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <Link to={`/inventions/${inv.id}`}>
                        <h3 className="font-bold text-sm text-slate-900 hover:text-teal-700 transition-colors line-clamp-1">
                          {inv.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {inv.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                        <span className="text-slate-500 text-[11px]">Cost:</span>
                        <span className="font-extrabold text-slate-900 font-mono">
                          ₹{parseFloat(inv.total_cost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Engagement Stats & Actions */}
                  <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        {inv.likes_count || 0} Likes
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                        {inv.comments_count || 0} Comments
                      </span>
                      <span className="flex items-center gap-1 font-extrabold text-emerald-700">
                        🤝 {inv.paid_reuses_count || 0} Paid Reuses
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <Link
                        to={`/inventions/${inv.id}`}
                        className="flex-1 text-center py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs active:scale-95"
                      >
                        View Showcase
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={() => {
                          const url = `${window.location.origin}/inventions/${inv.id}`;
                          navigator.clipboard?.writeText(url);
                          alert('Public link copied to clipboard!');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
                        title="Copy public link"
                      >
                        Share
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={() => setInventionToDelete(inv)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100/80 text-red-600 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Delete this posted invention"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: BUYERS & PAID OFFERS (CONFIDENTIAL)                     */}
      {/* ============================================================== */}
      {activeTab === 'offers' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-amber-900">Private Commercial Offers & Paid Reuses</div>
              <p className="text-amber-800 leading-relaxed">
                This section is strictly confidential to you. It lists every Official, Government Agency, Farmer Collective, or Investor who has offered to buy, rent, or paid licensing fees to reuse your inventions.
              </p>
            </div>
          </div>

          {buyers.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-md p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No commercial offers received yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When Officials, Companies, or Investors click "Buy / Rent / Pay to Reuse" on your inventions, their proposals and contact information will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {buyers.map((offer) => {
                const isPending = offer.status.toUpperCase() === 'PENDING';
                const isAccepted = offer.status.toUpperCase() === 'ACCEPTED';
                const isPaid = offer.status.toUpperCase() === 'PAID';

                return (
                  <div
                    key={offer.id}
                    className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-soft hover:shadow-md transition-shadow space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-sm">
                          {offer.buyer_name?.charAt(0) || 'O'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{offer.buyer_name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                              {offer.organization_name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{offer.buyer_email}</span>
                            {offer.buyer_phone && <span>• {offer.buyer_phone}</span>}
                            <span>•</span>
                            <span>{new Date(offer.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                          {offer.offer_type}
                        </span>

                        {isPaid && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Paid / Fulfilled
                          </span>
                        )}
                        {isAccepted && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                            Accepted Offer
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Target & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-semibold">Invention Target</span>
                        <Link to={`/inventions/${offer.invention_id}`} className="font-bold text-teal-700 hover:underline">
                          {offer.invention_title} &rarr;
                        </Link>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] block font-semibold">Offered / Paid Amount</span>
                        <span className="font-black text-slate-900 font-mono text-sm">
                          ₹{parseFloat(offer.amount_inr || 0).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] block font-semibold">Engagement Scope</span>
                        <span className="font-semibold text-slate-700">{offer.offer_type}</span>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-slate-700">Proposal Message:</span>
                      <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed italic">
                        "{offer.message}"
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      {isPending && (
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, 'ACCEPTED')}
                          disabled={updatingOfferId === offer.id}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          Accept Offer
                        </button>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, 'PAID')}
                          disabled={updatingOfferId === offer.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          Mark as Paid / Completed
                        </button>
                      )}

                      <a
                        href={`mailto:${offer.buyer_email}?subject=RE: ${offer.offer_type} proposal for ${offer.invention_title}`}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Email Buyer</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Delete Innovation Confirmation Modal */}
      <AnimatePresence>
        {inventionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Delete Innovation?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-slate-800">"{inventionToDelete.title}"</span>? This will permanently remove it from the public showcase catalog.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/70 rounded-xl border border-red-100 text-[11px] text-red-700 leading-normal flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>This action cannot be undone. Its hardware blueprint, SHA-256 provenance card, and showcase presence will be retired.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={deletingInvention}
                  onClick={() => setInventionToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={deletingInvention}
                  onClick={handleDeleteInvention}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {deletingInvention && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{deletingInvention ? 'Deleting...' : 'Yes, Delete Invention'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
