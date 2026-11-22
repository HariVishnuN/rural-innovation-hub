import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ShoppingBag, Handshake, Calendar, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Button } from '../../components/Button';

const CommercialOfferModal = ({ isOpen, onClose, invention, onOfferSuccess }) => {
  const { user } = useAuth();
  const [offerType, setOfferType] = useState('Paid Reuse'); // 'Paid Reuse', 'Buy', 'Rent'
  const [amount, setAmount] = useState(() => {
    if (!invention) return '25000';
    return String(Math.max(10000, Math.round(Number(invention.total_cost || 5000) * 1.5)));
  });
  const [organization, setOrganization] = useState('');
  const [contactName, setContactName] = useState(user?.full_name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [rentalMonths, setRentalMonths] = useState(3);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !invention) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!organization.trim()) {
      setError('Please provide your Organization, Company, or FPO name.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please specify a valid amount in INR (₹).');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setError('Please include a brief message or proposal scope for the inventor.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        offer_type: offerType,
        organization_name: organization.trim(),
        proposed_amount: Number(amount),
        amount_inr: Number(amount),
        official_name: contactName.trim() || 'Official Representative',
        official_email: contactEmail.trim() || 'official@department.gov',
        official_phone: contactPhone.trim(),
        rental_duration_months: offerType === 'Rent' ? Number(rentalMonths) : null,
        message: message.trim(),
      };

      const res = await apiClient.post(`/inventions/${invention.id}/offers`, payload);
      setSuccess(true);
      if (onOfferSuccess) {
        onOfferSuccess(res.data);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to submit commercial offer. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Commercial Engagement & Procurement</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{invention.title}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Success Banner */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Offer Submitted Successfully!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your <strong className="text-slate-800">{offerType}</strong> proposal of{' '}
                <strong className="text-teal-700">₹{Number(amount).toLocaleString()}</strong> was delivered to{' '}
                <strong>{invention.creator_name || 'the inventor'}</strong>.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Offer Type Selection with Spring Cards */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Engagement Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Paid Reuse', title: 'Paid Reuse', icon: Handshake, sub: 'Pay fee to replicate' },
                    { id: 'Buy', title: 'Buy Machine', icon: ShoppingBag, sub: 'Procure ready hardware' },
                    { id: 'Rent', title: 'Rent / Trial', icon: Calendar, sub: 'Seasonal field lease' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = offerType === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        onClick={() => setOfferType(t.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                        <div className="font-bold text-[11px]">{t.title}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">{t.sub}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization / Department *</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g., NABARD Agri-Fund, Kaveri Farmers FPO, ITC Agri-Business"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Official Representative"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="official@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>

              {/* Proposed Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Amount (INR ₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Base machine fabrication cost: ₹{Number(invention.total_cost || 0).toLocaleString()}</span>
                </div>

                {offerType === 'Rent' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rental Period (Months)</label>
                    <select
                      value={rentalMonths}
                      onChange={(e) => setRentalMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs cursor-pointer"
                    >
                      {[1, 2, 3, 6, 12].map((m) => (
                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Proposal Message */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposal Message / Deployment Scope *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your intended deployment region, cluster of farmers, or fabrication timeline..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <Button type="submit" variant="primary" isLoading={loading} className="py-2 px-5 font-bold">
                  Submit {offerType} Offer
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommercialOfferModal;
