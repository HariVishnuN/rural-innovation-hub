import React, { useState, useEffect } from 'react';
import { Users, Award, BookOpen, CheckCircle, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Card, Badge, Button } from '../../components/Button';
import Modal from '../../components/Modal';

const MentorshipPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [inventions, setInventions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedInventionId, setSelectedInventionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    setLoading(true);
    try {
      const [invRes, reqRes] = await Promise.all([
        apiClient.get('/inventions'),
        isAuthenticated ? apiClient.get('/mentorship/requests') : Promise.resolve({ data: [] }),
      ]);

      setInventions(invRes.data);
      if (invRes.data.length > 0) {
        setSelectedInventionId(invRes.data[0].id);
        // Fetch algorithmic matches for first invention
        const matchRes = await apiClient.get(`/mentorship/matches?invention_id=${invRes.data[0].id}`);
        setMentors(matchRes.data);
      }
      setRequests(reqRes.data);
    } catch (e) {
      console.warn('Mentorship data fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInventionChange = async (invId) => {
    setSelectedInventionId(invId);
    try {
      const matchRes = await apiClient.get(`/mentorship/matches?invention_id=${invId}`);
      setMentors(matchRes.data);
    } catch (e) {
      console.warn('Match fetch error', e);
    }
  };

  const handleOpenRequestModal = (mentor) => {
    if (!isAuthenticated) {
      alert('Please sign in to request technical mentorship.');
      return;
    }
    setSelectedMentor(mentor);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/mentorship/requests', {
        invention_id: parseInt(selectedInventionId),
        mentor_id: selectedMentor.mentor_id,
        notes: notes,
      });
      alert('Mentorship inquiry sent to advisor!');
      setRequestModalOpen(false);
      fetchMentorshipData();
    } catch (e) {
      alert('Failed to submit mentorship request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Technical Mentorship & Advisory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect with professors, mechanical kinematics specialists, and patent experts for structural vetting.
        </p>
      </div>

      {/* Select Invention for Match Scoring */}
      {inventions.length > 0 && (
        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-semibold text-teal-900">
              Calculate Mentor Affinity for Innovation:
            </span>
            <select
              value={selectedInventionId}
              onChange={(e) => handleInventionChange(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-teal-200 bg-white font-medium"
            >
              {inventions.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} - {inv.title} ({inv.category})
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-teal-800 font-medium">
            Heuristic matching based on mechanical keywords & domain overlap
          </span>
        </div>
      )}

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((m) => (
          <Card key={m.mentor_id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="blue">{m.organization || 'Research Center'}</Badge>
                <div className="flex items-center gap-1 text-teal-700 font-extrabold text-xs">
                  <span>{m.match_score}% Match</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{m.full_name}</h3>
                <p className="text-xs text-slate-600 mt-1">{m.skills_expertise}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Why this mentor matches
                </span>
                {m.matching_reasons.map((r, i) => (
                  <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => handleOpenRequestModal(m)}>
              Request Guidance
            </Button>
          </Card>
        ))}
      </div>

      {/* Active Requests (if authenticated) */}
      {isAuthenticated && requests.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Your Active Mentorship Inquiries</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between" hover={false}>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {r.invention_title} &rarr; Mentor: {r.mentor_name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{r.notes || 'No notes attached.'}</div>
                </div>
                <Badge variant={r.status === 'ACCEPTED' ? 'green' : 'amber'}>
                  {r.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestModalOpen && selectedMentor && (
        <Modal isOpen={true} onClose={() => setRequestModalOpen(false)} title="Send Mentorship Inquiry">
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="bg-sky-50 p-3 rounded-lg border border-sky-100 text-xs text-sky-900">
              Mentor: <span className="font-bold">{selectedMentor.full_name}</span> ({selectedMentor.match_score}% Match)
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">What technical advice do you need?</label>
              <textarea
                required
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Need feedback on whether the hydraulic pipe pressure rating is safe for prolonged continuous farm use..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Send Inquiry
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MentorshipPage;
