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
import { useToast } from '../../components/Toast';
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
  const { showToast } = useToast();
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/inventions/${invention.id}`);
      setIsDeleted(true);
      showToast('🗑️ Invention deleted successfully', 'info');
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

  // Toggle Like Handler with Micro-Feedback Pop & Toast
  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like grassroots innovations.');
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likesCount;
    const nextLiked = !previousLiked;
    const nextCount = previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1;
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      showToast('❤️ Added to your appreciated innovations', 'like');
    }

    // Broadcast like event to other open cards/windows
    window.dispatchEvent(
      new CustomEvent('rih_invention_liked', {
        detail: { inventionId: invention.id, liked: nextLiked, likesCount: nextCount, byUserId: user?.id },
      })
    );

    try {
      const res = await apiClient.post(`/inventions/${invention.id}/like`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
      window.dispatchEvent(
        new CustomEvent('rih_invention_liked', {
          detail: { inventionId: invention.id, liked: res.data.liked, likesCount: res.data.likes_count, byUserId: user?.id },
        })
      );
    } catch (e) {
      console.warn('Backend like sync notice; keeping optimistic state');
    }
  };

  // Sync likes across card instances in real time
  React.useEffect(() => {
    const handleLikeSync = (e) => {
      if (e.detail?.inventionId === invention.id) {
        setLikesCount(e.detail.likesCount);
        if (e.detail.byUserId === user?.id) {
          setIsLiked(e.detail.liked);
        }
      }
    };
    window.addEventListener('rih_invention_liked', handleLikeSync);
    return () => window.removeEventListener('rih_invention_liked', handleLikeSync);
  }, [invention.id, user?.id]);

  // Toggle Comments Drawer
  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      if (invention.sample_comments && invention.sample_comments.length > 0) {
        setComments(
          invention.sample_comments.map((c, i) => ({
            id: c.id || i + 1,
            user_name: c.author,
            user_role: c.role || 'Community Member',
            comment_text: c.text,
            created_at: new Date().toISOString(),
          }))
        );
      } else {
        setCommentsLoading(true);
        try {
          const res = await apiClient.get(`/inventions/${invention.id}/comments`);
          setComments(res.data);
        } catch (e) {
          console.warn('Failed to load comments from API, checking defaults', e);
          if (invention.sample_comments) {
            setComments(
              invention.sample_comments.map((c, i) => ({
                id: c.id || i + 1,
                user_name: c.author,
                user_role: c.role || 'Community Member',
                comment_text: c.text,
                created_at: new Date().toISOString(),
              }))
            );
          }
        } finally {
          setCommentsLoading(false);
        }
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
      console.warn('Backend comment sync notice; saving locally', err);
      const localComment = {
        id: Date.now(),
        user_name: user.full_name || 'Innovator',
        user_role: user.role || 'INNOVATOR',
        comment_text: newCommentText.trim(),
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, localComment]);
      setCommentsCount((prev) => prev + 1);
      setNewCommentText('');
      showToast('💬 Comment posted to discussion', 'comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Share link with Toast confirmation
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/inventions/${invention.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    showToast('📋 Blueprint link copied to clipboard', 'share');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOfferSuccess = () => {
    setPaidReusesCount((prev) => prev + 1);
    showToast('🤝 Offer submitted to innovator!', 'info');
    if (onUpdate) onUpdate();
  };

  if (isDeleted) {
    return null;
  }

  return (
    <motion.div
      whileHover={ultraLite ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-lifted hover:border-teal-300 transition-all duration-200 overflow-hidden flex flex-col group"
    >
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
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isMyInvention && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                Your Invention
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-xs whitespace-nowrap">
              {invention.category}
            </span>
            {getScalingStageBadge(invention.scaling_stage)}
          </div>
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

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold shadow-md cursor-pointer"
                >
                  <span>View Blueprints & Video</span>
                  <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                </motion.span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/40 shadow-xs">
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
          <button onClick={toggleComments} className="hover:underline text-slate-600 cursor-pointer">
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
        {/* Like Button with 180ms pop */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            isLiked
              ? 'text-red-600 bg-red-50/80 font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
          </motion.div>
          <span className="hidden sm:inline">{likesCount}</span>
        </motion.button>

        {/* Comment Button with tactile press */}
        <motion.button
          whileTap={{ scale: 0.95 }}
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

        {/* Share Button with tactile press */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="Copy Link to Invention"
        >
          {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Share2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
        </motion.button>

        {/* Buy / Rent / Pay to Reuse CTA or View Offers for Owner */}
        {isMyInvention ? (
          <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Link
              to="/profile?tab=offers"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-emerald-500/25 transition-all"
              title="View incoming commercial offers for your invention"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-200" />
              <span className="truncate">Offers ({paidReusesCount})</span>
            </Link>
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1, scale: 1.02 }}
            onClick={() => setIsOfferModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-teal-500/25 transition-all cursor-pointer"
            title="Buy, rent, or pay to reuse this invention"
          >
            <Handshake className="w-4 h-4 text-amber-300" />
            <span className="truncate">Buy / Reuse</span>
          </motion.button>
        )}
      </div>

      {/* Inline Comments Accordion Drawer (Smooth Height Expand/Collapse) */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            key="comments-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden bg-slate-50/90 border-t border-slate-100"
          >
            <div className="p-4 space-y-3 text-xs">
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
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={!user || !newCommentText.trim() || commentSubmitting}
                    className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-teal-600 text-white disabled:opacity-40 hover:bg-teal-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </motion.button>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commercial Offer / Buy / Rent Modal */}
      <CommercialOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        invention={invention}
        onOfferSuccess={handleOfferSuccess}
      />
    </motion.div>
  );
};

export default InventionCard;
