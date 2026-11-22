import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, AlertTriangle, Eye, Server, RefreshCw } from 'lucide-react';
import apiClient from '../../api/client';
import { Card, Badge, Button } from '../../components/Button';
import Modal from '../../components/Modal';

const AdminPage = () => {
  const [pendingQueue, setPendingQueue] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingInvId, setRejectingInvId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [queueRes, auditRes, flagRes, healthRes] = await Promise.all([
        apiClient.get('/admin/moderation'),
        apiClient.get('/admin/audit-logs'),
        apiClient.get('/admin/feature-flags'),
        apiClient.get('/health'),
      ]);
      setPendingQueue(queueRes.data);
      setAuditLogs(auditRes.data);
      setFeatureFlags(flagRes.data);
      setHealthStatus(healthRes.data);
    } catch (e) {
      console.warn('Admin data load error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/inventions/${id}/approve`);
      alert('Invention approved! Transaction committed and outbox notification created.');
      fetchAdminData();
    } catch (e) {
      alert('Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/inventions/${rejectingInvId}/reject`, {
        reason: rejectionReason,
      });
      alert('Invention rejected with feedback.');
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchAdminData();
    } catch (e) {
      alert('Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFlag = async (name, currentStatus) => {
    try {
      await apiClient.patch(`/admin/feature-flags/${name}`, { enabled: !currentStatus });
      fetchAdminData();
    } catch (e) {
      alert('Failed to update feature flag.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <span>Platform Governance & Moderation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin console for approving grassroots blueprints, inspecting audit trails, and toggling feature flags.
          </p>
        </div>

        {healthStatus && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>DB: {healthStatus.database}</span>
          </div>
        )}
      </div>

      {/* Moderation Queue */}
      <Card className="p-6 space-y-4" hover={false}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Pending Moderation Queue ({pendingQueue.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchAdminData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>

        {pendingQueue.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            All submitted inventions have been reviewed. Queue is clean!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingQueue.map((inv) => (
              <div key={inv.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">#{inv.id} {inv.title}</span>
                    <Badge variant="amber">{inv.category}</Badge>
                    <span className="text-[10px] text-slate-400 font-mono">SHA: {inv.sha256_hash.slice(0, 8)}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{inv.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleApprove(inv.id)} isLoading={actionLoading}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectingInvId(inv.id);
                      setRejectModalOpen(true);
                    }}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Feature Flags */}
      <Card className="p-6 space-y-4" hover={false}>
        <h2 className="text-sm font-bold text-slate-900">Dynamic Feature Flags</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {featureFlags.map((flag) => (
            <div key={flag.name} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">{flag.name}</div>
                <div className="text-[11px] text-slate-500">{flag.description}</div>
              </div>
              <button
                onClick={() => handleToggleFlag(flag.name, flag.enabled)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  flag.enabled ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {flag.enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Log Trail */}
      <Card className="p-6 space-y-4" hover={false}>
        <h2 className="text-sm font-bold text-slate-900">Governance Audit Trail (MySQL Stored)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Admin</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Target Entity</th>
                <th className="p-2.5">Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-2.5 text-slate-400 font-mono">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-2.5 font-semibold text-slate-800">{log.admin_name || 'Admin'}</td>
                  <td className="p-2.5">
                    <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-600">{log.entity_type} #{log.entity_id}</td>
                  <td className="p-2.5 text-slate-500">{log.reason || 'Standard review action'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal isOpen={true} onClose={() => setRejectModalOpen(false)} title="Reject Invention with Explanation">
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please explain to the innovator what modifications or safety adjustments are required before publication:
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Needs blade shroud specification and clearer electrical isolation steps..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
            />
            <Button type="submit" variant="danger" className="w-full" isLoading={actionLoading}>
              Confirm Rejection
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;
