import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Wrench,
  Droplets,
  Leaf,
  HeartHandshake,
  MessageSquare,
  Activity,
  Star,
  User,
  ShoppingBag,
  Key,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Play,
  FileText,
  Image as ImageIcon,
  Compass,
  Maximize2,
  Trash2,
  Loader2,
  Pause,
  Sparkles,
  Layers,
  RotateCcw,
  Cpu,
  Info,
  Eye,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Button, Card, Badge } from '../../components/Button';
import AudioPlayer from '../../components/AudioPlayer';
import Modal from '../../components/Modal';
import PledgeModal from '../funding/PledgeModal';
import CommercialOfferModal from '../offers/CommercialOfferModal';
import { resolveMediaUrl, getInitials } from '../../utils/media';
import { DEFAULT_INVENTIONS } from '../../data/defaultInventions';

const DEFAULT_INVENTION_IMG = "/images/inventions/solar-drip.svg";
const DEFAULT_BLUEPRINT_IMG = "/images/blueprints/solar-drip-blueprint.svg";
const DEFAULT_SKETCH_IMG = "/images/blueprints/solar-drip-blueprint.svg";
const DEFAULT_AVATAR = "/images/avatars/default.jpg";

const STAGES = [
  { key: 'RAW_PROTOTYPE', step: 1, label: 'Raw Prototype', desc: 'Initial workshop build' },
  { key: 'PEER_VALIDATED', step: 2, label: 'Peer Validated', desc: 'BOM & safety vetted' },
  { key: 'FIELD_TESTED', step: 3, label: 'Field-Tested', desc: 'Live farm conditions' },
  { key: 'MARKET_READY', step: 4, label: 'Market-Ready / Scaling', desc: 'Ready for official procurement' },
];

const InventionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [invention, setInvention] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Gallery Active View: 'photo' | 'blueprint' | 'bom_hotspots' | 'stop_motion' | 'sketch' | 'video'
  const [galleryTab, setGalleryTab] = useState('photo');

  // Interactive Product Gallery, Faux 3D & Stop-Motion States
  const [cinemagraphActive, setCinemagraphActive] = useState(true);
  const [stopMotionIndex, setStopMotionIndex] = useState(0);
  const [isStopMotionPlaying, setIsStopMotionPlaying] = useState(false);
  const [activeBOMHotspot, setActiveBOMHotspot] = useState(null);
  const [bpRotateX, setBpRotateX] = useState(0);
  const [bpRotateY, setBpRotateY] = useState(0);

  const handleBpMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setBpRotateX(((y - centerY) / centerY) * -7);
    setBpRotateY(((x - centerX) / centerX) * 7);
  };

  const handleBpMouseLeave = () => {
    setBpRotateX(0);
    setBpRotateY(0);
  };

  // Secondary Tab: 'assembly' | 'safety' | 'telemetry' | 'replications' | 'reviews' | 'provenance'
  const [secondaryTab, setSecondaryTab] = useState('assembly');

  // Modals
  const [stageUpdating, setStageUpdating] = useState(false);
  const [commercialModalOpen, setCommercialModalOpen] = useState(false);
  const [commercialOfferType, setCommercialOfferType] = useState('BUY');
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [certData, setCertData] = useState(null);
  const [certLoading, setCertLoading] = useState(false);

  // Replication Modal
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [repData, setRepData] = useState({ location: '', state: '', notes: '', build_cost: '' });
  const [repSubmitting, setRepSubmitting] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Image Zoom Modal
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchInvention();
    fetchTelemetry();
  }, [id]);

  // Auto-play timer for stop-motion fabrication sequence
  useEffect(() => {
    let timer;
    const stepsCount = invention?.assembly_steps?.length || 4;
    if (isStopMotionPlaying) {
      timer = setInterval(() => {
        setStopMotionIndex((prev) => (prev + 1) % stepsCount);
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isStopMotionPlaying, invention?.assembly_steps]);

  const fetchInvention = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/inventions/${id}`);
      if (res.data) {
        setInvention(res.data);
        if (res.data?.region) {
          setRepData((prev) => ({ ...prev, state: res.data.region }));
        }
      } else {
        throw new Error('Empty response');
      }
    } catch (e) {
      console.warn('Backend load failed, searching in verified reference innovations:', e);
      const fallback = DEFAULT_INVENTIONS.find(
        (inv) => String(inv.id) === String(id) || inv.title.toLowerCase().includes(String(id).toLowerCase())
      );
      if (fallback) {
        setInvention(fallback);
        if (fallback.region) {
          setRepData((prev) => ({ ...prev, state: fallback.region }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetry = async () => {
    try {
      const res = await apiClient.get(`/inventions/${id}/telemetry`);
      setTelemetry(res.data);
    } catch (e) {
      console.warn('Telemetry load error', e);
    }
  };

  const openCommercialModal = (type) => {
    setCommercialOfferType(type);
    setCommercialModalOpen(true);
  };

  const handleUpdateScalingStage = async (newStage) => {
    setStageUpdating(true);
    try {
      const res = await apiClient.patch(`/inventions/${id}/scaling-stage`, { scaling_stage: newStage });
      setInvention(res.data);
      alert(`Validation stage updated to: ${newStage.replace('_', ' ')}`);
    } catch (e) {
      alert('Failed to update validation stage.');
    } finally {
      setStageUpdating(false);
    }
  };

  const handleDeleteInvention = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/inventions/${id}`);
      navigate('/profile?tab=inventions');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete invention. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadCert = async () => {
    setCertLoading(true);
    try {
      const res = await apiClient.get(`/inventions/${id}/certificate`);
      setCertData(res.data);
      setCertOpen(true);
    } catch (e) {
      alert('Failed to generate IP certificate.');
    } finally {
      setCertLoading(false);
    }
  };

  const handleReplicationSubmit = async (e) => {
    e.preventDefault();
    setRepSubmitting(true);
    try {
      await apiClient.post(`/inventions/${id}/replications`, repData);
      alert('Your replication build has been recorded! Thank you for contributing to open-source hardware.');
      setRepModalOpen(false);
      fetchInvention();
    } catch (e) {
      alert('Error recording replication.');
    } finally {
      setRepSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to post a review.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await apiClient.post(`/inventions/${id}/reviews`, { rating, comment });
      setComment('');
      fetchInvention();
    } catch (e) {
      alert('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading open hardware specifications & blueprints...</p>
      </div>
    );
  }

  if (!invention) {
    return (
      <div className="py-24 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Invention not found</h3>
        <p className="text-xs text-slate-500">The requested rural innovation does not exist or was unlisted.</p>
        <Link to="/discover">
          <Button variant="primary" size="sm">
            Back to Showcase Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const creatorName = invention?.creator_name || 'Grassroots Innovator';
  const creatorLocation = [invention?.creator_village_city, invention?.creator_state || invention?.region]
    .filter(Boolean)
    .join(', ');

  const prototypePhoto = resolveMediaUrl(invention?.image_url, DEFAULT_INVENTION_IMG);
  const blueprintPhoto = resolveMediaUrl(invention?.blueprint_url, DEFAULT_BLUEPRINT_IMG);
  const sketchPhoto = resolveMediaUrl(invention?.sketch_url, DEFAULT_SKETCH_IMG);
  const videoUrl = invention?.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const creatorLower = (creatorName || '').trim().toLowerCase();
  const rawCreatorPhoto = invention?.creator_photo_url || (creatorLower.includes('ramesh') ? '/images/avatars/ramesh.jpg' : creatorLower.includes('kavita') ? '/images/avatars/kavita.jpg' : creatorLower.includes('suresh') ? '/images/avatars/suresh.jpg' : creatorLower.includes('hari') ? '/images/avatars/harivishnu.jpg' : DEFAULT_AVATAR);
  const creatorPhoto = resolveMediaUrl(rawCreatorPhoto, DEFAULT_AVATAR);

  const currentStageKey = invention.scaling_stage || (invention.field_tested ? 'FIELD_TESTED' : 'RAW_PROTOTYPE');
  const currentStageIndex = STAGES.findIndex((s) => s.key === currentStageKey) >= 0
    ? STAGES.findIndex((s) => s.key === currentStageKey)
    : 0;

  const isAuthorizedToAdvance =
    user && (user.role === 'ADMIN' || user.role === 'INVESTOR' || user.role === 'MENTOR' || user.id === invention.creator_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ============================================================== */}
      {/* HEADER BAR: Category, Title, Quick Actions                     */}
      {/* ============================================================== */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" className="text-xs font-bold px-3 py-1 bg-teal-600 text-white">
              {invention.category}
            </Badge>
            <span className="text-xs font-mono text-slate-600 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              📍 {invention.region}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
              currentStageKey === 'MARKET_READY'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : currentStageKey === 'FIELD_TESTED'
                ? 'bg-teal-100 text-teal-800 border-teal-300'
                : currentStageKey === 'PEER_VALIDATED'
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Stage: {STAGES[currentStageIndex]?.label || currentStageKey}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCert}
              isLoading={certLoading}
              className="text-xs font-semibold text-slate-700 hover:text-teal-700 border-slate-300"
            >
              <Shield className="w-4 h-4 text-teal-600 mr-1" />
              SHA-256 Provenance
            </Button>
            <Button
              variant="amber"
              size="sm"
              onClick={() => setPledgeOpen(true)}
              className="text-xs font-bold shadow-xs"
            >
              <HeartHandshake className="w-4 h-4 mr-1" />
              Pledge Support
            </Button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {invention.title}
        </h1>

        <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
          {invention.description}
        </p>
      </div>

      {/* ============================================================== */}
      {/* VALIDATION & MARKET-READINESS TRACKER (4-STAGE PIPELINE)       */}
      {/* ============================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Problem 5 Solved: Scaling & Validation Pipeline
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-700">Open-Hardware Readiness Index</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Validation & Market-Readiness Tracker
            </h3>
          </div>

          {/* Official Stage Advancement Control */}
          {isAuthorizedToAdvance && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">Advance Stage:</span>
              <select
                value={currentStageKey}
                onChange={(e) => handleUpdateScalingStage(e.target.value)}
                disabled={stageUpdating}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    Stage {s.step}: {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4-Stage Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {STAGES.map((s, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div
                key={s.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-teal-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Stage {s.step}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isCurrent && <Activity className="w-4 h-4 text-teal-600 animate-pulse" />}
                </div>

                <div className="text-xs font-black text-slate-900">{s.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: VISUAL SHOWCASE GALLERY (Interactive Product Suite) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        {/* Gallery Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setGalleryTab('photo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                galleryTab === 'photo'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Prototype Photo</span>
            </button>

            <button
              onClick={() => setGalleryTab('blueprint')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                galleryTab === 'blueprint'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Blueprint CAD</span>
            </button>

            <button
              onClick={() => setGalleryTab('bom_hotspots')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                galleryTab === 'bom_hotspots'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Interactive BOM Pins</span>
            </button>

            <button
              onClick={() => setGalleryTab('stop_motion')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                galleryTab === 'stop_motion'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-200" />
              <span>Stop-Motion Build</span>
            </button>

            <button
              onClick={() => setGalleryTab('sketch')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                galleryTab === 'sketch'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Maker Sketch</span>
            </button>

            <button
              onClick={() => setGalleryTab('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                galleryTab === 'video'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Demo Video</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            {galleryTab === 'photo' && (
              <button
                onClick={() => setCinemagraphActive(!cinemagraphActive)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  cinemagraphActive
                    ? 'bg-teal-50 border-teal-300 text-teal-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <Sparkles className={`w-3 h-3 ${cinemagraphActive ? 'text-teal-600 animate-spin-slow' : 'text-slate-400'}`} />
                <span>Cinemagraph: {cinemagraphActive ? 'ON' : 'OFF'}</span>
              </button>
            )}
            {galleryTab === 'blueprint' && '📐 Move cursor over CAD to tilt in 3D'}
            {galleryTab === 'bom_hotspots' && '🔍 Click numbered pins for part cost & scrap source'}
            {galleryTab === 'stop_motion' && '🎞️ Frame-by-frame fabrication sequence'}
            {galleryTab === 'sketch' && '✏️ Workshop Pencil Drawing'}
            {galleryTab === 'video' && '🎥 Live Operational Demo'}
          </div>
        </div>

        {/* Gallery Viewport */}
        <div className="relative bg-slate-900 flex items-center justify-center min-h-[380px] max-h-[540px] overflow-hidden select-none">
          {/* TAB 1: PROTO PHOTO WITH LIVING CINEMAGRAPH SHIMMER */}
          {galleryTab === 'photo' && (
            <div className="relative w-full h-[450px] group flex items-center justify-center">
              <img
                src={prototypePhoto}
                alt={invention.title}
                onError={(e) => {
                  e.target.src = DEFAULT_INVENTION_IMG;
                }}
                className="w-full h-full object-contain bg-slate-950 transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Cinemagraph Living Water/Light Sweep Layer */}
              {cinemagraphActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-sky-400/15 to-transparent pointer-events-none mix-blend-screen animate-pulse" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/80 text-teal-200 text-[10px] font-mono font-bold border border-teal-600/50 backdrop-blur-xs shadow-md">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    <span>Cinemagraph Living Simulation Active</span>
                  </div>
                </>
              )}

              <button
                onClick={() => setZoomedImage(prototypePhoto)}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Zoom High-Res
              </button>
            </div>
          )}

          {/* TAB 2: TECHNICAL BLUEPRINT WITH 3D PERSPECTIVE TILT */}
          {galleryTab === 'blueprint' && (
            <div
              onMouseMove={handleBpMouseMove}
              onMouseLeave={handleBpMouseLeave}
              className="relative w-full h-[450px] group bg-slate-950 flex items-center justify-center perspective-[1000px] overflow-hidden p-6"
            >
              <motion.div
                animate={{ rotateX: bpRotateX, rotateY: bpRotateY }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-full h-full max-w-3xl flex items-center justify-center"
              >
                <img
                  src={blueprintPhoto}
                  alt="Technical Blueprint"
                  onError={(e) => {
                    e.target.src = DEFAULT_BLUEPRINT_IMG;
                  }}
                  className="w-full h-full object-contain shadow-2xl rounded-xl border border-teal-500/20"
                />
                <div
                  className="absolute top-4 left-4 bg-teal-900/80 text-teal-100 text-xs px-3 py-1 rounded-md font-mono border border-teal-700 backdrop-blur-sm"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  Faux 3D CAD Perspective • Moving Cursor Tilts View
                </div>
              </motion.div>

              <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                <a
                  href={blueprintPhoto}
                  target="_blank"
                  rel="noreferrer"
                  download="blueprint.svg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Blueprint
                </a>
                <button
                  onClick={() => setZoomedImage(blueprintPhoto)}
                  className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Inspect Specs
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE BOM PINBOARD (HOTSPOTS) */}
          {galleryTab === 'bom_hotspots' && (
            <div className="relative w-full h-[450px] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
              <img
                src={blueprintPhoto}
                alt="BOM Schematic"
                onError={(e) => {
                  e.target.src = DEFAULT_BLUEPRINT_IMG;
                }}
                className="w-full h-full object-contain opacity-70"
              />

              {/* Interactive Numbered Hotspot Pins */}
              {(invention.materials && invention.materials.length > 0
                ? invention.materials
                : [
                    { item_name: 'Main Chassis Frame', unit_cost: 350, local_source: 'Scrap yard', quantity: '1 set' },
                    { item_name: 'Pressure Valve & Regulator', unit_cost: 450, local_source: 'Panchayat depot', quantity: '2 pcs' },
                    { item_name: 'Drip Manifold Tube', unit_cost: 280, local_source: 'Local market', quantity: '50m' },
                    { item_name: 'Micro-Dripper Emitters', unit_cost: 160, local_source: 'Agritech coop', quantity: '30 pcs' },
                  ]
              ).map((m, idx) => {
                const pinCoords = [
                  { top: '35%', left: '28%' },
                  { top: '48%', left: '46%' },
                  { top: '65%', left: '68%' },
                  { top: '78%', left: '82%' },
                  { top: '25%', left: '60%' },
                  { top: '55%', left: '18%' },
                ];
                const pos = pinCoords[idx % pinCoords.length];
                const isSelected = activeBOMHotspot === idx;

                return (
                  <div
                    key={idx}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute cursor-pointer group"
                    onClick={() => setActiveBOMHotspot(isSelected ? null : idx)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-teal-400 opacity-60" />
                      <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform ${
                        isSelected ? 'bg-amber-500 text-slate-950 scale-125 ring-2 ring-white' : 'bg-teal-500 text-slate-950 group-hover:scale-110'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute bottom-10 -left-28 w-56 p-3 rounded-xl bg-slate-900/95 border border-teal-500/50 shadow-2xl text-white text-xs z-30 space-y-1.5 backdrop-blur-md text-left"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                          <span className="font-extrabold text-teal-300 font-mono">
                            Part #{idx + 1}
                          </span>
                          <span className="font-bold text-amber-400 font-mono">
                            ₹{parseFloat(m.unit_cost || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="font-bold text-slate-100">{m.item_name}</div>
                        <div className="text-[10px] text-slate-400">
                          Qty: <strong className="text-slate-200">{m.quantity}</strong> • Source: <strong className="text-slate-200">{m.local_source || 'Local Market'}</strong>
                        </div>
                        {m.optimized_alternative && (
                          <div className="text-[10px] text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/40 font-mono">
                            💡 Scrap Alt: {m.optimized_alternative}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}

              <div className="absolute top-4 left-4 bg-sky-950/80 text-sky-200 text-xs px-3 py-1 rounded-md font-mono border border-sky-700/60 backdrop-blur-xs">
                Interactive X-Ray BOM Pinboard • Click any pin to inspect part
              </div>
            </div>
          )}

          {/* TAB 4: STOP-MOTION MECHANICAL FABRICATION SEQUENCE */}
          {galleryTab === 'stop_motion' && (
            <div className="relative w-full h-[450px] bg-slate-950 flex flex-col justify-between p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                    FRAME 0{(stopMotionIndex || 0) + 1} / 0{(invention.assembly_steps?.length || 4)}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Stop-Motion DIY Fabrication Sequence
                  </span>
                </div>

                <button
                  onClick={() => setIsStopMotionPlaying(!isStopMotionPlaying)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {isStopMotionPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isStopMotionPlaying ? 'Pause' : 'Play Stop-Motion'}</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stopMotionIndex}
                  initial={{ opacity: 0, scale: 0.96, rotate: -0.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.02, rotate: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/90 rounded-2xl border-2 border-slate-700 p-6 space-y-3 shadow-xl max-w-2xl mx-auto w-full my-auto text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      {(stopMotionIndex || 0) + 1}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {invention.assembly_steps && invention.assembly_steps[stopMotionIndex]?.step_title
                        ? invention.assembly_steps[stopMotionIndex].step_title
                        : `Fabrication Phase 0${stopMotionIndex + 1}`}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {invention.assembly_steps && invention.assembly_steps[stopMotionIndex]?.instruction
                      ? invention.assembly_steps[stopMotionIndex].instruction
                      : 'Follow blueprint tolerances and weld support struts using local scrap.'}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      Local Tools: <strong className="text-slate-200">Angle Grinder, Welding Rig, Screwdriver</strong>
                    </span>
                    <span className="text-teal-400">
                      Step Verified ✓
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 flex-1">
                  {Array.from({ length: invention.assembly_steps?.length || 4 }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setStopMotionIndex(idx);
                        setIsStopMotionPlaying(false);
                      }}
                      className={`h-2.5 rounded-full transition-all cursor-pointer flex-1 ${
                        stopMotionIndex === idx
                          ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          : idx < stopMotionIndex
                          ? 'bg-teal-500'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setStopMotionIndex(0);
                    setIsStopMotionPlaying(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Restart from beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PENCIL SKETCH */}
          {galleryTab === 'sketch' && (
            <div className="relative w-full h-[450px] group bg-amber-950/20 flex items-center justify-center">
              <img
                src={sketchPhoto}
                alt="Pencil Sketch"
                onError={(e) => {
                  e.target.src = DEFAULT_SKETCH_IMG;
                }}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-amber-900/80 text-amber-100 text-xs px-3 py-1 rounded-md font-mono border border-amber-700 backdrop-blur-sm">
                Maker's Workshop Pencil Drawing
              </div>
              <button
                onClick={() => setZoomedImage(sketchPhoto)}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Inspect Sketch
              </button>
            </div>
          )}

          {/* TAB 6: DEMO VIDEO */}
          {galleryTab === 'video' && (
            <div className="w-full h-[450px] flex items-center justify-center bg-black">
              {videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('/uploads/')) ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full max-w-4xl object-contain bg-black"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={videoUrl}
                  title="Working Prototype Video Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full max-w-4xl border-0"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2-COLUMN SECTION: Cost Breakdown (Left) vs Inventor & Offers   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2 Cols): SECTION 2 - Cost Estimation Breakdown  */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 overflow-hidden bg-white border-slate-200" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                  Transparency & Bill of Materials
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Fabrication Cost Estimation Breakdown
                </h3>
              </div>
              <div className="bg-teal-50 px-4 py-2 rounded-xl border border-teal-200/80 text-right">
                <span className="text-[10px] text-teal-700 block font-semibold uppercase">
                  Total Build Cost
                </span>
                <span className="text-xl font-black text-teal-900">
                  ₹{parseFloat(invention.total_cost || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Unit Cost (₹)</th>
                    <th className="py-2.5 px-3">Local Source</th>
                    <th className="py-2.5 px-3">Optimized Scrap Alternative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invention.materials && invention.materials.length > 0 ? (
                    invention.materials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">{m.item_name}</td>
                        <td className="py-3 px-3 text-slate-600">{m.quantity}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">₹{parseFloat(m.unit_cost || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-500">{m.local_source || 'Local Market'}</td>
                        <td className="py-3 px-3 text-teal-700 font-medium">
                          {m.optimized_alternative || 'Standard'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No materials breakdown listed for this invention.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>* Frugal components evaluated using verified local scrap yard & village hardware benchmarks.</span>
              <span className="font-semibold text-slate-700">Currency: INR (₹)</span>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (1 Col): SECTION 3 & 4 (Inventor Profile + Rent/Buy Actions) */}
        <div className="space-y-6">
          {/* SECTION 4: OWNER MANAGEMENT OR OFFICIALS COMMERCIAL ACTION BOX */}
          {user && String(user.id) === String(invention.creator_id) ? (
            <Card className="p-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-600 shadow-md space-y-4" hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                      Your Invention Hub
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Owner Management
                    </h3>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  You Are The Creator
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                This is your published innovation. You can review incoming commercial offers, rent inquiries, or update blueprint specifications from your private workspace.
              </p>

              <div className="space-y-2.5 pt-1">
                <Link to="/profile?tab=offers" className="block">
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold text-xs py-2.5"
                  >
                    <Eye className="w-4 h-4 text-emerald-200" />
                    <span>View Commercial Offers ({invention.paid_reuses_count || 0})</span>
                  </Button>
                </Link>

                <Link to="/profile?tab=inventions" className="block">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs py-2.5"
                  >
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <span>Manage Inventions in Dashboard</span>
                  </Button>
                </Link>

                <Button
                  variant="danger"
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete This Invention</span>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-gradient-to-br from-teal-50 via-white to-sky-50 border-2 border-teal-600 shadow-md space-y-4" hover={false}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 block">
                    Officials Portal Actions
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Rent, Buy or License Prototype
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you an Investor, Government Department, or Agritech Enterprise? Submit an official commercial inquiry backed by MySQL records.
              </p>

              <div className="space-y-2.5 pt-1">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-bold text-xs py-2.5"
                  onClick={() => openCommercialModal('BUY')}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy Invention Prototype</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-teal-600 text-teal-800 hover:bg-teal-100 font-bold text-xs py-2.5"
                  onClick={() => openCommercialModal('RENT')}
                >
                  <Key className="w-4 h-4 text-teal-600" />
                  <span>Rent / Lease for Field Trials</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs py-2.5"
                  onClick={() => openCommercialModal('LICENSE')}
                >
                  <FileCheck className="w-4 h-4 text-slate-500" />
                  <span>License Manufacturing Rights</span>
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 3: INVENTOR PROFILE CARD */}
          <Card className="p-6 bg-white border-slate-200 shadow-soft space-y-4" hover={false}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={creatorPhoto}
                  alt={creatorName}
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full object-cover shrink-0 ring-2 ring-teal-600 shadow-sm bg-white"
                />
                {invention.creator_verified && (
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white"
                    title="Verified Grassroots Innovator"
                  >
                    ✓
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-black text-slate-900">{creatorName}</h4>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{creatorLocation}</span>
                </div>
                {invention.creator_verified && (
                  <span className="text-[10px] font-bold text-teal-700 block mt-0.5">
                    Verified Grassroots Innovator
                  </span>
                )}
              </div>
            </div>

            {invention.creator_bio && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                "{invention.creator_bio}"
              </p>
            )}

            <div className="space-y-2 pt-1 text-xs text-slate-600">
              {invention.creator_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{invention.creator_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified Direct Message</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/messages?partner=${invention.creator_id}&invention=${invention.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Contact Inventor Directly</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 5: SECONDARY TABS (Neatly Tucked Below)               */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 sm:p-8 space-y-6">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'assembly', label: 'Step-by-Step Assembly & Audio' },
            { id: 'safety', label: 'Safety & ESG Impact' },
            { id: 'telemetry', label: `IoT Telemetry (${telemetry.length})` },
            { id: 'replications', label: `Replication Tracker (${invention.replications_count || 0})` },
            { id: 'reviews', label: `Reviews & Ratings (${invention.reviews?.length || 0})` },
            { id: 'provenance', label: 'Cryptographic SHA-256' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSecondaryTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                secondaryTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Assembly Steps & Audio */}
        {secondaryTab === 'assembly' && (
          <div className="space-y-6">
            {invention.assembly_steps && invention.assembly_steps.length > 0 && (
              <AudioPlayer steps={invention.assembly_steps} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invention.assembly_steps?.map((st, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                      {st.step || idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">{st.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Safety & ESG Matrix */}
        {secondaryTab === 'safety' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Heuristic Safety Matrix</span>
                </h4>
                <span className="text-base font-extrabold text-teal-700">{invention.safety_score}/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${invention.safety_score}%` }} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {invention.durability_notes || 'Standard mechanical assembly with hand tools.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900">Estimated Environmental Impact</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-100">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-teal-600" /> CO₂ Avoided:
                  </span>
                  <span className="font-bold">{parseFloat(invention.estimated_co2_savings_kg)} kg/year</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-100">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" /> Water Conserved:
                  </span>
                  <span className="font-bold">{parseFloat(invention.estimated_water_savings_liters).toLocaleString()} L/year</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: IoT Telemetry */}
        {secondaryTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Real-World Field Sensor Telemetry</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live data streamed from IoT field loggers and pump controllers.
                </p>
              </div>
            </div>

            {telemetry.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No sensor telemetry logged yet for this prototype.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2.5">Recorded At</th>
                      <th className="p-2.5">Power (Watts)</th>
                      <th className="p-2.5">Daily Runtime</th>
                      <th className="p-2.5">Hydraulic Efficiency</th>
                      <th className="p-2.5">Ambient Temp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {telemetry.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-500">{new Date(t.recorded_at).toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-slate-800">{t.power_watts} W</td>
                        <td className="p-2.5 text-slate-600">{t.runtime_hours} hrs</td>
                        <td className="p-2.5 text-teal-700 font-bold">{t.efficiency_percentage}%</td>
                        <td className="p-2.5 text-slate-600">{t.ambient_temp_c}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Replications */}
        {secondaryTab === 'replications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Community Replication Proofs</h4>
                <p className="text-xs text-slate-500">Documented independent builds across India's villages.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) alert('Please sign in to log a replication.');
                  else setRepModalOpen(true);
                }}
              >
                + Record My Replication
              </Button>
            </div>

            <p className="text-xs text-slate-600">
              Total Recorded Replications: <span className="font-bold text-teal-700">{invention.replications_count || 0} builds</span>
            </p>
          </div>
        )}

        {/* Tab 5: Reviews */}
        {secondaryTab === 'reviews' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {invention.reviews?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No community reviews yet. Be the first to build and review!</p>
              ) : (
                invention.reviews?.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{r.user_name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Leave a Field Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-700 font-semibold">Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="px-2 py-1 text-xs rounded border border-slate-300"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Solid Frugal Machine</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Needs Modification</option>
                    <option value={1}>1 Star - High Wear & Tear</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your practical experience testing or building this machine..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
                <Button type="submit" size="sm" isLoading={reviewSubmitting}>
                  Submit Review
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 6: Cryptographic Provenance */}
        {secondaryTab === 'provenance' && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-slate-900">Cryptographic Timestamp & Fingerprint</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every innovation submitted to the Rural Innovation Hub receives an indelible SHA-256 cryptographic digest binding the creator's ID, technical specifications, and timestamp to establish public open hardware provenance.
            </p>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] break-all select-all">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">SHA-256 Hash Digest:</span>
              {invention.sha256_hash}
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadCert} isLoading={certLoading}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Generate & Download IP Provenance Certificate PDF
            </Button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODALS                                                         */}
      {/* ============================================================== */}
      {/* Commercial Offer Modal */}
      {commercialModalOpen && (
        <CommercialOfferModal
          isOpen={commercialModalOpen}
          onClose={() => setCommercialModalOpen(false)}
          invention={invention}
          defaultOfferType={commercialOfferType}
          onSuccess={() => {
            fetchInvention();
          }}
        />
      )}

      {/* Pledge Modal */}
      {pledgeOpen && (
        <PledgeModal
          inventionId={invention.id}
          inventionTitle={invention.title}
          onClose={() => setPledgeOpen(false)}
          onSuccess={() => {
            setPledgeOpen(false);
            fetchInvention();
          }}
        />
      )}

      {/* Provenance Certificate Modal */}
      {certOpen && certData && (
        <Modal isOpen={true} onClose={() => setCertOpen(false)} title="IP Provenance Certificate" maxWidth="max-w-xl">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 font-sans text-slate-800">
            <div className="text-center border-b border-slate-200 pb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-teal-700">Rural Innovation Hub</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Certificate of Open Hardware Provenance</h3>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">{certData.certificate_id}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div><span className="font-semibold text-slate-600">Invention Title:</span> <span className="font-bold text-slate-900">{certData.title}</span></div>
              <div><span className="font-semibold text-slate-600">Inventor:</span> {certData.creator_name} ({certData.creator_location})</div>
              <div><span className="font-semibold text-slate-600">Published Timestamp:</span> {new Date(certData.submission_timestamp).toUTCString()}</div>
              <div><span className="font-semibold text-slate-600">Verification URL:</span> <span className="font-mono text-teal-700">{certData.verification_url}</span></div>
              <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] break-all">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Cryptographic Fingerprint (SHA-256):</span>
                {certData.sha256_hash}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic leading-relaxed pt-2 border-t border-slate-200">
              {certData.disclaimer}
            </p>

            <Button variant="primary" size="sm" className="w-full" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-1.5" />
              Print / Save Certificate PDF
            </Button>
          </div>
        </Modal>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <Modal isOpen={true} onClose={() => setZoomedImage(null)} title="Blueprint & Prototype Inspection" maxWidth="max-w-4xl">
          <div className="space-y-4">
            <div className="bg-slate-950 p-2 rounded-xl flex items-center justify-center max-h-[75vh] overflow-auto">
              <img src={zoomedImage} alt="Zoomed view" className="max-w-full h-auto object-contain rounded" />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setZoomedImage(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Replication Modal */}
      {repModalOpen && (
        <Modal isOpen={true} onClose={() => setRepModalOpen(false)} title="Record Replication Build" maxWidth="max-w-md">
          <form onSubmit={handleReplicationSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Workshop / Farm Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Milk Cooperative Workshop"
                value={repData.location}
                onChange={(e) => setRepData({ ...repData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={repData.state}
                onChange={(e) => setRepData({ ...repData, state: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Build Cost (INR)</label>
              <input
                type="number"
                placeholder={invention.total_cost}
                value={repData.build_cost}
                onChange={(e) => setRepData({ ...repData, build_cost: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Adjustments Made</label>
              <textarea
                rows={3}
                placeholder="e.g. Replaced aluminum pulleys with cast iron from old flour mill..."
                value={repData.notes}
                onChange={(e) => setRepData({ ...repData, notes: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={repSubmitting}>
              Submit Replication Proof
            </Button>
          </form>
        </Modal>
      )}

      {/* Delete Innovation Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
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
                    Are you sure you want to delete <span className="font-bold text-slate-800">"{invention?.title}"</span>? This will permanently retire this invention from the Rural Innovation Hub.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/70 rounded-xl border border-red-100 text-[11px] text-red-700 leading-normal flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>This action cannot be undone. Its blueprint data, SHA-256 certificate, and showcase presence will be removed.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={deleting}
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={deleting}
                  onClick={handleDeleteInvention}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{deleting ? 'Deleting...' : 'Yes, Delete Invention'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventionDetail;
