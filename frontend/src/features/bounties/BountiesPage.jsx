import React, { useState, useEffect } from 'react';
import { Award, Plus, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Button, Card, Badge } from '../../components/Button';
import Modal from '../../components/Modal';

const BountiesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post Bounty Modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [newBounty, setNewBounty] = useState({
    title: '',
    description: '',
    region: user?.state || 'Gujarat',
    reward_amount: 25000,
  });
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Submit Solution Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [userInventions, setUserInventions] = useState([]);
  const [selectedInventionId, setSelectedInventionId] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [submittingSolution, setSubmittingSolution] = useState(false);

  useEffect(() => {
    fetchBounties();
  }, []);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/bounties');
      setBounties(res.data);
    } catch (e) {
      console.warn('Error loading bounties', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostBounty = async (e) => {
    e.preventDefault();
    setPostSubmitting(true);
    try {
      await apiClient.post('/bounties', newBounty);
      setPostModalOpen(false);
      fetchBounties();
    } catch (e) {
      alert('Failed to post bounty.');
    } finally {
      setPostSubmitting(false);
    }
  };

  const openSubmitSolution = async (bounty) => {
    if (!isAuthenticated) {
      alert('Please sign in to submit a solution.');
      return;
    }
    setSelectedBounty(bounty);
    try {
      const res = await apiClient.get('/inventions');
      setUserInventions(res.data);
      if (res.data.length > 0) setSelectedInventionId(res.data[0].id);
      setSubmitModalOpen(true);
    } catch (e) {
      alert('Failed to fetch inventions for submission.');
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    setSubmittingSolution(true);
    try {
      await apiClient.post(`/bounties/${selectedBounty.id}/submissions`, {
        invention_id: parseInt(selectedInventionId),
        note: submissionNote,
      });
      alert('Your prototype has been submitted for this problem bounty!');
      setSubmitModalOpen(false);
      fetchBounties();
    } catch (e) {
      alert('Error submitting solution.');
    } finally {
      setSubmittingSolution(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grassroots Problem Bounties</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real challenges posted by farmers, village panchayats, and cooperatives awaiting open hardware solutions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (!isAuthenticated) alert('Please sign in to post a challenge.');
            else setPostModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Post a Rural Challenge
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading open bounties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((b) => (
            <Card key={b.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="amber">{b.region}</Badge>
                  <span className="text-sm font-extrabold text-emerald-700">
                    ₹{parseFloat(b.reward_amount).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{b.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{b.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {b.submissions_count || 0} solutions submitted
                </span>
                <Button variant="outline" size="sm" onClick={() => openSubmitSolution(b)}>
                  Submit Solution
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Post Bounty Modal */}
      {postModalOpen && (
        <Modal isOpen={true} onClose={() => setPostModalOpen(false)} title="Post a Grassroots Problem Statement">
          <form onSubmit={handlePostBounty} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Challenge Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Ergonomic Pepper Harvester for Hill Tribes"
                value={newBounty.title}
                onChange={(e) => setNewBounty({ ...newBounty, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Problem Description</label>
              <textarea
                required
                rows={4}
                placeholder="Explain the farming or artisanal difficulty, why existing commercial machines fail, and required weight/cost constraints..."
                value={newBounty.description}
                onChange={(e) => setNewBounty({ ...newBounty, description: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Region / State</label>
                <input
                  type="text"
                  required
                  value={newBounty.region}
                  onChange={(e) => setNewBounty({ ...newBounty, region: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reward / Grant Pool (INR)</label>
                <input
                  type="number"
                  required
                  value={newBounty.reward_amount}
                  onChange={(e) => setNewBounty({ ...newBounty, reward_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={postSubmitting}>
              Publish Bounty Challenge
            </Button>
          </form>
        </Modal>
      )}

      {/* Submit Solution Modal */}
      {submitModalOpen && selectedBounty && (
        <Modal isOpen={true} onClose={() => setSubmitModalOpen(false)} title="Submit Innovation to Problem Bounty">
          <form onSubmit={handleSubmitSolution} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              Challenging: <span className="font-bold">{selectedBounty.title}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Your Solution Invention</label>
              <select
                value={selectedInventionId}
                onChange={(e) => setSelectedInventionId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {userInventions.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.id} - {inv.title} (₹{inv.total_cost})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Implementation Note</label>
              <textarea
                rows={3}
                placeholder="Explain how this blueprint specifically solves the posted constraints..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={submittingSolution}>
              Submit Solution
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BountiesPage;
