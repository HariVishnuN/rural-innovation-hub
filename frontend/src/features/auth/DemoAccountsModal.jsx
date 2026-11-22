import React, { useEffect, useState } from 'react';
import { User, Shield, Wrench, Coins, ArrowRight, Check } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../app/AuthContext';
import Modal from '../../components/Modal';

const DemoAccountsModal = ({ onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const { switchDemoAccount } = useAuth();

  useEffect(() => {
    apiClient
      .get('/auth/demo-accounts')
      .then((res) => setAccounts(res.data))
      .catch((err) => {
        console.warn('Could not load demo accounts from API, using defaults:', err);
        setAccounts([
          { role: 'INNOVATOR', name: 'HARI VISHNU N (Innovator)', username: 'hxrivxnu', pin: '1234', email: 'nharivishnu31072008@gmail.com', password: 'Password@123', description: 'Grassroots Innovator & Platform User.', profile_photo_url: '/images/avatars/harivishnu.jpg' },
          { role: 'INNOVATOR', name: 'Ramesh Patel (Maker)', username: 'ramesh', pin: '1234', email: 'ramesh@ruralhub.org', password: 'Innovator@123', description: 'Farmer & grassroots mechanic in Gujarat with solar drip irrigation.', profile_photo_url: '/images/avatars/ramesh.jpg' },
          { role: 'INVESTOR', name: 'Ananya Sengupta (Impact)', username: 'ananya', pin: '1234', email: 'ananya@ruralhub.org', password: 'Investor@123', description: 'Impact investor funding micro-mechanization and water conservation.', profile_photo_url: '/images/avatars/ananya.jpg' },
          { role: 'MENTOR', name: 'Prof. Rajesh Sharma (Advisor)', username: 'prof.sharma', pin: '1234', email: 'prof.sharma@ruralhub.org', password: 'Mentor@123', description: 'IIT Mechanical Engineering Professor specializing in frugal mechanics.', profile_photo_url: '/images/avatars/rajesh.jpg' },
          { role: 'ADMIN', name: 'System Administrator (Gov)', username: 'admin', pin: '1234', email: 'admin@ruralhub.org', password: 'Admin@123', description: 'Moderator managing verification, audit logs, and system metrics.', profile_photo_url: '/images/avatars/admin.jpg' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAccount = async (account) => {
    try {
      setSwitching(true);
      await switchDemoAccount(account.email, account.password);
      onClose();
    } catch (e) {
      alert(`Login failed: ${e.response?.data?.detail || e.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'INNOVATOR':
        return <Wrench className="w-5 h-5 text-teal-600" />;
      case 'INVESTOR':
        return <Coins className="w-5 h-5 text-amber-600" />;
      case 'MENTOR':
        return <User className="w-5 h-5 text-sky-600" />;
      case 'ADMIN':
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Select Demo Persona" maxWidth="max-w-xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-600">
          Click any role below to instantly authenticate and evaluate the platform through that persona's permissions and workflows.
        </p>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading demo accounts...</div>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.email}
                onClick={() => !switching && handleSelectAccount(acc)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                <img
                  src={acc.profile_photo_url || `/images/avatars/${acc.username || acc.email.split('@')[0]}.jpg`}
                  alt={acc.name}
                  onError={(e) => { e.target.src = '/images/avatars/default.jpg'; }}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 bg-white shadow-2xs flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                      {acc.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {acc.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{acc.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-bold border border-teal-200">
                      @{acc.username || acc.email.split('@')[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono font-bold border border-amber-200">
                      PIN: {acc.pin || '1234'}
                    </span>
                    <span className="text-slate-400 font-mono">{acc.email}</span>
                  </div>
                </div>
                <button className="mt-1 text-slate-400 group-hover:text-teal-600 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DemoAccountsModal;
