import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Key,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Phone,
  Mail,
  IndianRupee,
  Calendar,
  AlertCircle,
  Inbox,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Card, Badge, Button } from '../../components/Button';

const CommercialOffersPage = () => {
  const { user, isInnovator } = useAuth();
  const [activeTab, setActiveTab] = useState(isInnovator ? 'received' : 'sent');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffers();
  }, [activeTab]);

  const fetchOffers = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'received' ? '/offers/received' : '/offers/sent';
      const res = await apiClient.get(endpoint);
      setOffers(res.data);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Could not load commercial offers.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (offerId, newStatus) => {
    setUpdatingId(offerId);
    try {
      await apiClient.patch(`/offers/${offerId}/status`, { status: newStatus });
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update offer status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'NEGOTIATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Negotiating
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BUY':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'RENT':
        return <Key className="w-4 h-4 text-sky-600" />;
      case 'LICENSE':
        return <FileCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            Commercial Transactions & Inquiries
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial Showcase Offers
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Direct procurement, field-trial leasing, and technology licensing proposals between Grassroots Innovators and Officials (Investors, Government Departments, and Agritech Enterprises).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'received'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Received Offers
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sent'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent Proposals
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Offers List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading commercial offers...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No {activeTab} offers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'received'
              ? 'When Officials (Investors, Govt officials) submit a Buy or Rent proposal on your inventions, they will appear here.'
              : 'You have not submitted any Buy, Rent, or License proposals yet. Visit the Showcase Catalog to explore innovations.'}
          </p>
          <Link to="/discover">
            <Button variant="primary" size="sm" className="mt-2">
              Browse Showcase Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="p-5 bg-white border-slate-200 hover:border-slate-300 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                      {getTypeIcon(offer.offer_type)}
                      {offer.offer_type === 'BUY' && 'BUY PROTOTYPE'}
                      {offer.offer_type === 'RENT' && 'RENT / LEASE'}
                      {offer.offer_type === 'LICENSE' && 'LICENSE DESIGN'}
                    </span>
                    {getStatusBadge(offer.status)}
                    <span className="text-[11px] text-slate-400 font-mono">
                      Ref #{offer.id} • {new Date(offer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    <span className="font-bold text-slate-900">
                      Organization: {offer.organization_name}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="text-xs text-slate-600">
                      Representative: {offer.official_name}
                    </span>
                  </div>

                  {offer.message && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                      "{offer.message}"
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                    {offer.official_email && (
                      <a href={`mailto:${offer.official_email}`} className="inline-flex items-center gap-1 hover:text-teal-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{offer.official_email}</span>
                      </a>
                    )}
                    {offer.official_phone && (
                      <a href={`tel:${offer.official_phone}`} className="inline-flex items-center gap-1 hover:text-teal-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{offer.official_phone}</span>
                      </a>
                    )}
                    {offer.rental_duration_months && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Duration: {offer.rental_duration_months} Months
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="lg:text-right">
                    <span className="text-[11px] text-slate-500 block">Proposed Commercial Value</span>
                    <span className="text-xl font-black text-teal-800">
                      ₹{parseFloat(offer.proposed_amount).toLocaleString()}
                    </span>
                  </div>

                  {/* Actions for Inventor */}
                  {activeTab === 'received' && offer.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        isLoading={updatingId === offer.id}
                        onClick={() => handleStatusUpdate(offer.id, 'ACCEPTED')}
                      >
                        Accept Proposal
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-700 hover:bg-slate-100 text-xs"
                        isLoading={updatingId === offer.id}
                        onClick={() => handleStatusUpdate(offer.id, 'NEGOTIATING')}
                      >
                        Negotiate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50 text-xs border-rose-200"
                        isLoading={updatingId === offer.id}
                        onClick={() => handleStatusUpdate(offer.id, 'REJECTED')}
                      >
                        Decline
                      </Button>
                    </div>
                  )}

                  <Link
                    to={`/inventions/${offer.invention_id}`}
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    <span>View Invention Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommercialOffersPage;
