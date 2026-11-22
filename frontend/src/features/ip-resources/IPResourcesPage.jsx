import React, { useState, useEffect } from 'react';
import { Shield, BookOpen, FileCheck, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import { Card, Button } from '../../components/Button';
import Modal from '../../components/Modal';

const IPResourcesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [inventions, setInventions] = useState([]);
  const [selectedInvId, setSelectedInvId] = useState('');
  const [licenseeName, setLicenseeName] = useState('');
  const [licenseeType, setLicenseeType] = useState('Small Rural Enterprise');
  const [royalty, setRoyalty] = useState('5.0');
  const [generatedContract, setGeneratedContract] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/inventions').then((res) => {
      setInventions(res.data);
      if (res.data.length > 0) setSelectedInvId(res.data[0].id);
    });
  }, []);

  const handleGenerateLicense = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to generate licensing agreements.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/inventions/${selectedInvId}/licenses`, {
        licensee_name: licenseeName,
        licensee_entity_type: licenseeType,
        royalty_percentage: parseFloat(royalty),
        territory: 'India',
      });
      setGeneratedContract(res.data);
    } catch (e) {
      alert('Failed to generate license contract.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grassroots Intellectual Property & Prior Art Guide</h1>
        <p className="text-xs text-slate-500 mt-1">
          How frugal innovators protect open-hardware designs, prevent predatory patents, and negotiate fair community royalties.
        </p>
      </div>

      {/* Educational Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3" hover={false}>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">Defensive Prior Art</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By publishing complete blueprints with cryptographic timestamps, you establish verifiable public disclosure. Under international patent law, no entity can subsequently patent what already exists in the public domain.
          </p>
        </Card>

        <Card className="p-5 space-y-3" hover={false}>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">SHA-256 Provenance Fingerprints</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every invention submission generates an immutable 64-character hash tied to your user profile and exact submission UTC timestamp, serving as undeniable evidence of first authorship.
          </p>
        </Card>

        <Card className="p-5 space-y-3" hover={false}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">Community Royalty Sharing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Smallholder farmers replicate designs freely. Commercial equipment manufacturers who scale the machine for profit agree to fair licensing terms that channel royalties back to the village inventor.
          </p>
        </Card>
      </div>

      {/* Licensing Draft Generator */}
      <div id="licensing" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-soft space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-600" />
            <span>Generate Grassroots Non-Exclusive Licensing Draft</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Instantly create a standard grassroots open-hardware license with royalty sharing between the inventor and local makerspaces.
          </p>
        </div>

        <form onSubmit={handleGenerateLicense} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Invention</label>
            <select
              value={selectedInvId}
              onChange={(e) => setSelectedInvId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              {inventions.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} - {inv.title} ({inv.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Licensee Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kaveri Agro Tools Pvt Ltd"
                value={licenseeName}
                onChange={(e) => setLicenseeName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Entity Type</label>
              <select
                value={licenseeType}
                onChange={(e) => setLicenseeType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Small Rural Enterprise">Small Rural Enterprise</option>
                <option value="Farmers Producer Organization (FPO)">Farmers Producer Organization (FPO)</option>
                <option value="Regional Machinery Manufacturer">Regional Machinery Manufacturer</option>
                <option value="State Agro Corporation">State Agro Corporation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Royalty Percentage</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="15"
              required
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standard grassroots recommendation is 4% to 6% on ex-factory sales price.
            </p>
          </div>

          <Button type="submit" variant="primary" isLoading={submitting}>
            Generate Agreement Draft
          </Button>
        </form>

        {/* Contract Preview Result */}
        {generatedContract && (
          <div className="mt-6 p-6 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              DRAFT GRASSROOTS TECHNOLOGY LICENSE (CONTRACT #{generatedContract.id})
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {generatedContract.contract_terms}
            </div>
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-sans border-t border-slate-200">
              <span>Status: {generatedContract.status}</span>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="w-3.5 h-3.5 mr-1" /> Print Contract Draft
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPResourcesPage;
