import React, { useState } from 'react';
import { HeartHandshake, Coins, Wrench, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import Modal from '../../components/Modal';
import { Button } from '../../components/Button';

const PledgeModal = ({ inventionId, inventionTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [pledgeType, setPledgeType] = useState('MONETARY'); // 'MONETARY' | 'SPARE_PARTS'
  const [amount, setAmount] = useState('1000');
  const [spareParts, setSpareParts] = useState('');
  const [donorName, setDonorName] = useState(user?.full_name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await apiClient.post(`/inventions/${inventionId}/pledges`, {
        pledge_type: pledgeType,
        amount: pledgeType === 'MONETARY' ? parseFloat(amount) : 0,
        spare_part_details: pledgeType === 'SPARE_PARTS' ? spareParts : null,
        donor_name: donorName,
        donor_email: donorEmail,
        notes: notes,
      });
      alert('Your pledge has been recorded! The grassroots innovator will be notified.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit pledge.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Pledge Support for Rural Innovation" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 text-xs text-teal-900">
          Supporting: <span className="font-bold">{inventionTitle}</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pledge Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contribution Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPledgeType('MONETARY')}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                pledgeType === 'MONETARY'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Micro-Grant (₹ INR)</span>
            </button>

            <button
              type="button"
              onClick={() => setPledgeType('SPARE_PARTS')}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                pledgeType === 'SPARE_PARTS'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Wrench className="w-4 h-4 text-teal-600" />
              <span>Donate Spare Parts</span>
            </button>
          </div>
        </div>

        {pledgeType === 'MONETARY' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pledge Amount (INR)</label>
            <input
              type="number"
              min="100"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
            <div className="flex gap-2 mt-2">
              {[500, 1000, 2500, 5000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Spare Parts Details</label>
            <textarea
              required
              rows={3}
              value={spareParts}
              onChange={(e) => setSpareParts(e.target.value)}
              placeholder="e.g. Donating two 12V 40W DC diaphragm pumps and 50 meters drip pipe..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
            <input
              type="email"
              required
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Encouragement (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Great work on this irrigation tool..."
            className="w-full p-2 text-xs rounded-lg border border-slate-300"
          />
        </div>

        <div className="text-[11px] text-slate-500 italic">
          * Note: Pledges record verified community commitments to help makers scale. Monetary transfers are settled directly with the cooperative or inventor.
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
          Confirm Pledge
        </Button>
      </form>
    </Modal>
  );
};

export default PledgeModal;
