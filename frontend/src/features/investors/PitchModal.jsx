import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/AuthContext';
import apiClient from '../../api/client';
import Modal from '../../components/Modal';
import { Button } from '../../components/Button';
import { Send, AlertCircle, CheckCircle2, DollarSign, Lightbulb } from 'lucide-react';

const PitchModal = ({ isOpen, onClose, targetInvestor, onSuccess }) => {
  const { user } = useAuth();
  const [inventions, setInventions] = useState([]);
  const [loadingInventions, setLoadingInventions] = useState(true);
  const [selectedInventionId, setSelectedInventionId] = useState('');
  const [pitchTitle, setPitchTitle] = useState('');
  const [pitchNotes, setPitchNotes] = useState('');
  const [fundingNeeded, setFundingNeeded] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      fetchUserInventions();
    }
  }, [isOpen]);

  const fetchUserInventions = async () => {
    setLoadingInventions(true);
    try {
      // Fetch public inventions and prioritize user's own, or all inventions if demo
      const res = await apiClient.get('/inventions');
      const all = res.data || [];
      const userOwn = all.filter((inv) => inv.creator_id === user?.id);
      const available = userOwn.length > 0 ? userOwn : all;
      setInventions(available);
      if (available.length > 0) {
        setSelectedInventionId(available[0].id.toString());
        setPitchTitle(`Scaling & Deployment Grant for ${available[0].title}`);
        setFundingNeeded(available[0].total_cost ? Math.round(available[0].total_cost * 15).toString() : '150000');
      }
    } catch (e) {
      console.error('Failed to load inventions', e);
    } finally {
      setLoadingInventions(false);
    }
  };

  const handleInventionSelect = (e) => {
    const invId = e.target.value;
    setSelectedInventionId(invId);
    const chosen = inventions.find((i) => i.id.toString() === invId);
    if (chosen) {
      setPitchTitle(`Scaling & Deployment Grant for ${chosen.title}`);
      if (chosen.total_cost) {
        setFundingNeeded(Math.round(chosen.total_cost * 15).toString());
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInventionId) {
      setError('Please select an invention to pitch.');
      return;
    }
    if (!pitchTitle.trim() || !pitchNotes.trim() || !fundingNeeded) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiClient.post('/pitches', {
        investor_id: targetInvestor.id,
        invention_id: parseInt(selectedInventionId, 10),
        pitch_title: pitchTitle.trim(),
        pitch_notes: pitchNotes.trim(),
        funding_needed: parseFloat(fundingNeeded),
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit pitch.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!targetInvestor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pitch to ${targetInvestor.full_name}`}>
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Pitch Submitted Successfully!</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your proposal has been registered in the database. An instant notification and direct message thread have been sent to{' '}
            <span className="font-bold text-slate-800">{targetInvestor.full_name}</span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 ring-2 ring-teal-600/40 flex-shrink-0">
              <img
                src={targetInvestor.profile_photo_url || '/images/inventors/vikram-deshmukh.svg'}
                alt={targetInvestor.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/inventors/vikram-deshmukh.svg';
                }}
              />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">{targetInvestor.full_name}</div>
              <div className="text-[11px] text-teal-700 font-semibold">{targetInvestor.organization_college || 'Impact Partner'}</div>
              <div className="text-[10px] text-slate-500">Typical Range: {targetInvestor.typical_funding_range}</div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Your Invention to Pitch *
            </label>
            {loadingInventions ? (
              <div className="text-xs text-slate-400 py-2">Loading inventions...</div>
            ) : inventions.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                You haven't submitted any inventions yet. Submit an invention first from your workspace!
              </div>
            ) : (
              <select
                value={selectedInventionId}
                onChange={handleInventionSelect}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                {inventions.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title} ({inv.category} • Stage: {inv.scaling_stage?.replace('_', ' ') || 'Prototype'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pitch Headline / Proposal Title *
            </label>
            <input
              type="text"
              required
              value={pitchTitle}
              onChange={(e) => setPitchTitle(e.target.value)}
              placeholder="e.g. Scaling & Pilot Deployment of Solar Drip System in 20 Villages"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Funding / Grant Required (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={fundingNeeded}
                onChange={(e) => setFundingNeeded(e.target.value)}
                placeholder="150000"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Estimated budget for batch manufacturing, tooling, or village field trials.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pitch Proposal & Problem-Solution Details *
            </label>
            <textarea
              required
              rows={4}
              value={pitchNotes}
              onChange={(e) => setPitchNotes(e.target.value)}
              placeholder="Explain: 1) What specific rural problem this solves. 2) Current field results. 3) How the requested funding will be deployed (tooling, batch fabrication, distribution). 4) Why this solves the scaling barrier..."
              className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              className="bg-teal-600 hover:bg-teal-700 font-bold text-xs"
              disabled={inventions.length === 0}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send Pitch Proposal
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PitchModal;
