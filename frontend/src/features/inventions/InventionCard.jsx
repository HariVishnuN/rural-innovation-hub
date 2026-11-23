import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Handshake,
  CheckCircle2,
  Leaf,
  Droplets,
  Star,
  Wrench,
  Send,
  MapPin,
  ExternalLink,
  Check,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { useUltraLite } from '../../app/UltraLiteContext';
import apiClient from '../../api/client';
import CommercialOfferModal from '../offers/CommercialOfferModal';

const DEFAULT_FALLBACK_IMG = "/images/inventions/solar-drip.svg";
const DEFAULT_AVATAR = "/images/avatars/default.jpg";

export const getScalingStageBadge = (stage) => {
  switch (stage) {
    case 'MARKET_READY':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
          🚀 Market-Ready
        </span>
      );
    case 'FIELD_TESTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          🌱 Field-Tested
        </span>
      );
    case 'PEER_VALIDATED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
          🔍 Peer Validated
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
          ⚙️ Raw Prototype
        </span>
      );
  }
};

const InventionCard = ({ invention, onUpdate }) => {
  const { user } = useAuth();
  const { ultraLite } = useUltraLite();
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Social Engagement State
  const [isLiked, setIsLiked] = useState(Boolean(invention.is_liked_by_me));
  const [likesCount, setLikesCount] = useState(Number(invention.likes_count || 0));
  const [commentsCount, setCommentsCount] = useState(Number(invention.comments_count || 0));
  const [paidReusesCount, setPaidReusesCount] = useState(Number(invention.paid_reuses_count || 0));

  // Inline Comments State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Faux 3D Tilt & Specular Glare Coordinates
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleCardMouseMove = (e) => {
    if (ultraLite) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rX = ((y - centerY) / centerY) * -6;
    const rY = ((x - centerX) / centerX) * 6;
    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleCardMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/inventions/${invention.id}`);
      setIsDeleted(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete invention.');
      setIsDeleting(false);
    }
  };

  const creatorName = invention.creator_name || 'Grassroots Innovator';
  const creatorLocation = [invention.creator_village_city, invention.creator_state || invention.region]
    .filter(Boolean)
    .join(', ');

  const isMyInvention = Boolean(user && String(user.id) === String(invention.creator_id));

  const imageSrc = !imgError && invention.image_url ? invention.image_url : DEFAULT_FALLBACK_IMG;
  const avatarSrc = !avatarError && invention.creator_photo_url ? invention.creator_photo_url : DEFAULT_AVATAR;

  // Format creation date
  const formattedDate = invention.created_at
    ? new Date(invention.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Post';

  // Toggle Like Handler
  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like grassroots innovations.');
      return;
    }

    // Optimistic UI update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const res = await apiClient.post(`/inventions/${invention.id}/like`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (e) {
      // Rollback
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  // Toggle Comments Drawer
  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setCommentsLoading(true);
      try {
        const res = await apiClient.get(`/inventions/${invention.id}/comments`);
        setComments(res.data);
      } catch (e) {
        console.warn('Failed to load comments', e);
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  // Submit New Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!user) {
      alert('Please sign in to comment on this invention.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const res = await apiClient.post(`/inventions/${invention.id}/comments`, {
        comment_text: newCommentText.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setCommentsCount((prev) => prev + 1);
      setNewCommentText('');
    } catch (err) {
      alert('Failed to post comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Share link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/inventions/${invention.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOfferSuccess = () => {
    setPaidReusesCount((prev) => prev + 1);
    if (onUpdate) onUpdate();
  };

  if (isDeleted) {
    return null;
  }

  return (
    <motion.div
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      animate={ultraLite ? { y: 0 } : { rotateX, rotateY }}
      whileHover={ultraLite ? { y: -4 } : { y: -6 }}
      transition={{ type: 'spring', damping: 20, stiffness: 220 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className="relative bg-white rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 overflow-hidden flex flex-col group"
    >
      {/* Specular Interactive Glass Glare */}
      {!ultraLite && glarePos.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-30"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)`,
          }}
        />
      )}
      {/* LinkedIn-Style Post Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatarSrc}
              alt={creatorName}
              onError={() => setAvatarError(true)}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20 border border-slate-200 bg-white"
            />
            {invention.creator_verified && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold ring-1 ring-white"
                title="Verified Grassroots Innovator"
              >
                ✓
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 hover:text-teal-700 transition-colors">
                {creatorName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200/50">
                Grassroots Innovator
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {creatorLocation}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Category & Scaling Stage Badges */}
        <div className="flex flex-col items-end gap-1">
          {isMyInvention && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              Your Invention
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-xs">
            {invention.category}
          </span>
          {getScalingStageBadge(invention.scaling_stage)}
        </div>
      </div>

      {/* Post Text & Title */}
      <div className="px-4 sm:px-5 pt-3 pb-2 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/inventions/${invention.id}`} className="flex-1">
            <h3 className="text-base font-bold text-slate-900 hover:text-teal-600 transition-colors leading-snug">
              {invention.title}
            </h3>
          </Link>
          {isMyInvention && (
            <Link
              to={`/inventions/${invention.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80 hover:bg-teal-100 transition-colors flex-shrink-0"
              title="Edit invention blueprints & specs"
            >
              <Wrench className="w-3 h-3 text-teal-600" />
              <span>Edit Specs</span>
            </Link>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
          {invention.description}
        </p>
      </div>

      {/* Post Hardware Visual (Large, High Contrast, 3D Depth & Cinemagraph Shimmer) */}
      <div className="px-4 sm:px-5 py-2" style={{ transform: 'translateZ(18px)' }}>
        <Link to={`/inventions/${invention.id}`} className="block relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {!ultraLite ? (
            <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
              <img
                src={imageSrc}
                alt={invention.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                loading="lazy"
              />
              {/* Cinemagraph Living Light Sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-400/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shimmer pointer-events-none" />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-bold shadow-md">
                  <span>View Blueprints & Video</span>
                  <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                </span>
                <span className="px-2 py-1 rounded bg-teal-900/80 text-teal-200 text-[10px] font-mono font-bold border border-teal-500/30 backdrop-blur-xs">
                  Cinemagraph Preview
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-teal-50/50 flex flex-col items-center justify-center">
              <Wrench className="w-10 h-10 text-teal-600 mb-2" />
              <span className="text-xs font-bold text-teal-900">{invention.category} Blueprint</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">Ref: {invention.sha256_hash?.slice(0, 12)}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Cost & Impact Bar */}
      <div className="px-4 sm:px-5 py-2 flex items-center justify-between gap-2 flex-wrap text-xs bg-slate-50/70 mx-4 sm:mx-5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Fabrication Cost:</span>
          <span className="font-extrabold text-slate-900 font-mono text-sm">
            ₹{parseFloat(invention.total_cost || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1 text-teal-700 font-semibold" title="Estimated Carbon Offset">
            <Leaf className="w-3.5 h-3.5 text-teal-600" />
            <span>{parseFloat(invention.estimated_co2_savings_kg || 0)} kg CO₂</span>
          </div>
          {parseFloat(invention.estimated_water_savings_liters || 0) > 0 && (
            <div className="flex items-center gap-1 text-sky-700 font-semibold" title="Estimated Water Conservation">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>{parseFloat(invention.estimated_water_savings_liters).toLocaleString()} L</span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Stats Strip */}
      <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px]">
            ❤️
          </span>
          <span className="font-semibold text-slate-700">{likesCount}</span>
          <span>{likesCount === 1 ? 'Like' : 'Likes'}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button onClick={toggleComments} className="hover:underline text-slate-600">
            {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
          </button>
          <span>•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            🤝 {paidReusesCount} {paidReusesCount === 1 ? 'Paid Reuse' : 'Paid Reuses'}
          </span>
        </div>
      </div>

      {/* LinkedIn Interactive Action Bar */}
      <div className="px-2 sm:px-4 py-1.5 grid grid-cols-4 gap-1.5 border-b border-slate-100">
        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            isLiked
              ? 'text-red-600 bg-red-50/80 font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.45, 0.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
          </motion.div>
          <span className="hidden sm:inline">{likesCount}</span>
        </motion.button>

        {/* Comment Button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.03 }}
          onClick={toggleComments}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
            showComments
              ? 'text-teal-700 bg-teal-50 font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Comment</span>
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="Copy Link to Invention"
        >
          {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Share2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
        </motion.button>

        {/* Buy / Rent / Pay to Reuse CTA or View Offers + Delete for Owner */}
        {isMyInvention ? (
          <div className="flex items-center gap-1">
            <Link
              to="/profile?tab=offers"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-emerald-500/25 transition-all shimmer-btn-fx"
              title="View incoming commercial offers for your invention"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-200" />
              <span className="truncate">Offers ({paidReusesCount})</span>
            </Link>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08, y: -1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
              title="Delete this invention"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.04, y: -1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => setIsOfferModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-teal-500/25 transition-all cursor-pointer shimmer-btn-fx"
            title="Buy, rent, or pay to reuse this invention"
          >
            <Handshake className="w-4 h-4 text-amber-300" />
            <span className="truncate">Buy / Reuse</span>
          </motion.button>
        )}
      </div>

      {/* Inline Comments Drawer (Expandable) */}
      {showComments && (
        <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3 animate-fade-in text-xs">
          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {user ? user.full_name?.charAt(0) : '?'}
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={user ? "Write a supportive comment or question..." : "Sign in to post a comment..."}
                disabled={!user || commentSubmitting}
                className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!user || !newCommentText.trim() || commentSubmitting}
                className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-teal-600 text-white disabled:opacity-40 hover:bg-teal-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-4 text-[11px] text-slate-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-3 text-[11px] text-slate-400">
              No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{c.user_name}</span>
                      {c.user_role && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                          {c.user_role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{c.comment_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Commercial Offer / Buy / Rent Modal */}
      <CommercialOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        invention={invention}
        onOfferSuccess={handleOfferSuccess}
      />

      {/* Delete Confirmation Modal for Card */}
      <AnimatePresence>
        {isDeleteModalOpen && (
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
                <div className="space-y-1 text-left">
                  <h3 className="text-lg font-black text-slate-900">
                    Delete Innovation?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-slate-800">"{invention.title}"</span>? This will permanently remove it from the showcase catalog.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/70 rounded-xl border border-red-100 text-[11px] text-red-700 leading-normal flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>This action cannot be undone. Its showcase entry and commercial inquiries will be retired.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Invention'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InventionCard;
