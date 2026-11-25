import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  DollarSign,
  Send,
  MessageSquare,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Button, Card, Badge } from '../../components/Button';
import PitchModal from './PitchModal';

const SECTOR_OPTIONS = [
  'All',
  'Agriculture',
  'Water & Irrigation',
  'Renewable Energy',
  'Small Farm Machinery',
];

const InvestorsDirectoryPage = () => {
  const { user, isAuthenticated, isInnovator } = useAuth();

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'pitches'
  const [investors, setInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  // Pitch Modal State
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [selectedInvestorForPitch, setSelectedInvestorForPitch] = useState(null);

  // Pitches State
  const [pitches, setPitches] = useState([]);
  const [loadingPitches, setLoadingPitches] = useState(false);
  const [pitchStatusNotes, setPitchStatusNotes] = useState({});

  useEffect(() => {
    fetchInvestors();

    // Auto-refresh when tab gains focus or on interval for live investor directory
    const handleFocus = () => fetchInvestors(false);
    const handleNewUser = () => fetchInvestors(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('rih_new_user_registered', handleNewUser);

    const interval = setInterval(() => {
      fetchInvestors(false);
    }, 20000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('rih_new_user_registered', handleNewUser);
      clearInterval(interval);
    };
  }, [selectedSector]);

  useEffect(() => {
    if (activeTab === 'pitches' && isAuthenticated) {
      fetchPitches();
    }
  }, [activeTab, isAuthenticated]);

  const fetchInvestors = async (showLoader = true) => {
    if (showLoader) setLoadingInvestors(true);
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      const res = await apiClient.get('/investors', { params });
      let data = res.data || [];
      if (selectedSector !== 'All') {
        data = data.filter((inv) =>
          inv.focus_sectors?.some((s) => s.toLowerCase().includes(selectedSector.toLowerCase())) ||
          (inv.skills_expertise && inv.skills_expertise.toLowerCase().includes(selectedSector.toLowerCase()))
        );
      }
      setInvestors(data);
    } catch (e) {
      console.error('Failed to load investors', e);
    } finally {
      if (showLoader) setLoadingInvestors(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvestors();
  };

  const fetchPitches = async () => {
    setLoadingPitches(true);
    try {
      const isOfficial = user?.role === 'INVESTOR' || user?.role === 'ADMIN';
      const endpoint = isOfficial ? '/pitches/received' : '/pitches/sent';
      const res = await apiClient.get(endpoint);
      setPitches(res.data || []);
    } catch (e) {
      console.error('Failed to load pitches', e);
    } finally {
      setLoadingPitches(false);
    }
  };

  const handleOpenPitch = (inv) => {
    if (!isAuthenticated) {
      alert('Please sign in or use Demo Inventor Login to pitch your invention.');
      return;
    }
    setSelectedInvestorForPitch(inv);
    setPitchModalOpen(true);
  };

  const handleUpdatePitchStatus = async (pitchId, newStatus) => {
    const feedback = pitchStatusNotes[pitchId] || '';
    try {
      await apiClient.patch(`/pitches/${pitchId}/status`, {
        status: newStatus,
        feedback_notes: feedback,
      });
      alert(`Pitch updated to ${newStatus}`);
      fetchPitches();
    } catch (e) {
      alert('Failed to update pitch status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & In Review
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5" /> Under Due Diligence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Problem 4 Solved: Bridging the Investor Discovery Barrier</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Investors, NGOs & Government Officials Directory
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Pitch directly to NABARD officials, CSR rural development foundations, and agritech impact venture funds.
            No brokers, no gatekeepers—submit your open-source hardware and Bill of Materials directly for grant or equity backing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Browse Directory ({investors.length})
            </button>
            <button
              onClick={() => setActiveTab('pitches')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pitches'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {user?.role === 'INVESTOR' || user?.role === 'ADMIN' ? 'Received Proposals' : 'My Pitches & Grants'}
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <Building2 className="w-96 h-96" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DIRECTORY                                               */}
      {/* ============================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Sector Filters */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by investor name, organization (e.g. NABARD, Aavishkaar), or keywords..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="font-bold text-xs">
                Search Directory
              </Button>
            </form>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-teal-600" /> Focus Sector:
              </span>
              {SECTOR_OPTIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedSector === sec
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Investor Cards Grid */}
          {loadingInvestors ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading verified investors and government officials...</p>
            </div>
          ) : investors.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No funding partners found</h3>
              <p className="text-xs text-slate-500">
                Try resetting your keyword search or selecting a different focus sector filter.
              </p>
              <Button variant="outline" size="sm" onClick={() => { setKeyword(''); setSelectedSector('All'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((inv) => (
                <Card
                  key={inv.id}
                  className="p-6 bg-white border-slate-200 flex flex-col justify-between hover:border-teal-400 transition-all shadow-soft"
                >
                  <div className="space-y-4">
                    {/* Top Identity Row */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-teal-600/30 flex-shrink-0 shadow-xs">
                        <img
                          src={inv.profile_photo_url || '/images/inventors/vikram-deshmukh.svg'}
                          alt={inv.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/inventors/vikram-deshmukh.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 truncate">{inv.full_name}</h3>
                          <Badge variant="teal" className="text-[10px] font-bold px-2 py-0.5">
                            {inv.role === 'ADMIN' ? 'Govt / Admin' : 'Impact Investor'}
                          </Badge>
                        </div>
                        <div className="text-xs font-semibold text-teal-800 mt-0.5 flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 flex-shrink-0 text-teal-600" />
                          <span>{inv.organization_college || 'Rural Impact Fund'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{inv.state || 'All-India'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {inv.bio}
                    </p>

                    {/* Key Details Box */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Ticket / Grant Size:</span>
                        <span className="font-bold text-slate-900 text-teal-900">
                          {inv.typical_funding_range}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Domain Expertise:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[160px]">
                          {inv.skills_expertise}
                        </span>
                      </div>
                    </div>

                    {/* Sector Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {inv.focus_sectors?.map((sec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-teal-600 hover:bg-teal-700 font-bold text-xs py-2 shadow-xs"
                      onClick={() => handleOpenPitch(inv)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Pitch My Invention
                    </Button>
                    <Link to={`/messages?partner=${inv.id}`} className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="px-3 border-slate-300 text-slate-700 hover:bg-slate-100">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY PITCHES & PROPOSALS                                  */}
      {/* ============================================================== */}
      {activeTab === 'pitches' && (
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4">
              <Users className="w-12 h-12 text-teal-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Sign in to track your proposals</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Log in to view pitches sent to government bodies, track due diligence progress, and manage funding agreements.
              </p>
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : loadingPitches ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading pitch records from MySQL...</p>
            </div>
          ) : pitches.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No pitches found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {user?.role === 'INVESTOR' || user?.role === 'ADMIN'
                  ? 'You have not received any investment proposals yet.'
                  : 'You have not submitted any pitches yet. Browse the directory above to pitch your hardware!'}
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('directory')}>
                Browse Directory
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pitches.map((p) => (
                <Card key={p.id} className="p-6 bg-white border-slate-200 shadow-soft space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">{p.pitch_title}</h3>
                        {getStatusBadge(p.status)}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span>
                          Target Invention:{' '}
                          <Link to={`/inventions/${p.invention_id}`} className="font-bold text-teal-700 hover:underline">
                            {p.invention_title}
                          </Link>
                        </span>
                        <span>•</span>
                        <span>Submitted on {new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-teal-50 px-4 py-2 rounded-xl border border-teal-200 text-right">
                      <span className="text-[10px] text-teal-700 block font-semibold uppercase">
                        Funding Requested
                      </span>
                      <span className="text-lg font-black text-teal-900">
                        ₹{parseFloat(p.funding_needed).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Parties Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Inventor</span>
                      <div className="font-bold text-slate-800">{p.inventor_name}</div>
                      <div className="text-slate-500">{p.inventor_location}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Investor</span>
                      <div className="font-bold text-slate-800">{p.investor_name}</div>
                      <div className="text-teal-700 font-semibold">{p.organization_name || 'Impact Fund'}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="text-xs text-slate-700 bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                      Proposal Details:
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">{p.pitch_notes}</p>
                  </div>

                  {/* Feedback Notes if any */}
                  {p.feedback_notes && (
                    <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl space-y-1">
                      <span className="font-bold block">Reviewer Feedback:</span>
                      <p>{p.feedback_notes}</p>
                    </div>
                  )}

                  {/* Official Action Controls if User is the recipient */}
                  {(user?.role === 'INVESTOR' || user?.role === 'ADMIN') && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Optional feedback notes for the inventor..."
                        value={pitchStatusNotes[p.id] || ''}
                        onChange={(e) =>
                          setPitchStatusNotes({ ...pitchStatusNotes, [p.id]: e.target.value })
                        }
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-sky-700 border-sky-300 hover:bg-sky-50"
                          onClick={() => handleUpdatePitchStatus(p.id, 'UNDER_REVIEW')}
                        >
                          Mark Under Review
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleUpdatePitchStatus(p.id, 'ACCEPTED')}
                        >
                          Accept Proposal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleUpdatePitchStatus(p.id, 'DECLINED')}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pitch Modal */}
      {pitchModalOpen && (
        <PitchModal
          isOpen={pitchModalOpen}
          onClose={() => setPitchModalOpen(false)}
          targetInvestor={selectedInvestorForPitch}
          onSuccess={() => {
            fetchInvestors();
            if (activeTab === 'pitches') fetchPitches();
          }}
        />
      )}
    </div>
  );
};

export default InvestorsDirectoryPage;
