import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Shield, Globe, Award, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900">
                <Lightbulb className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-bold text-lg text-white">Rural Innovation Hub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open-hardware platform documenting, protecting, and diffusing frugal grassroots engineering for smallholder farmers and rural artisans.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <Shield className="w-4 h-4" />
              <span>SHA-256 Provenance Timestamped</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/discover?category=Agriculture" className="hover:text-teal-400">Agricultural Tools</Link></li>
              <li><Link to="/discover?category=Water%20%26%20Irrigation" className="hover:text-teal-400">Water & Drip Irrigation</Link></li>
              <li><Link to="/discover?category=Renewable%20Energy" className="hover:text-teal-400">Solar & Renewable</Link></li>
              <li><Link to="/discover?category=Small%20Farm%20Machinery" className="hover:text-teal-400">Farm Machinery</Link></li>
              <li><Link to="/workshops" className="hover:text-teal-400">Rural Makerspaces</Link></li>
            </ul>
          </div>

          {/* Governance & Community */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/bounties" className="hover:text-teal-400">Grassroots Problem Bounties</Link></li>
              <li><Link to="/mentorship" className="hover:text-teal-400">Technical Mentors Network</Link></li>
              <li><Link to="/ip-resources" className="hover:text-teal-400">Prior Art & IP Guide</Link></li>
              <li><Link to="/analytics" className="hover:text-teal-400">Impact & ESG Analytics</Link></li>
              <li><Link to="/ip-resources#licensing" className="hover:text-teal-400">Grassroots Licensing Drafts</Link></li>
            </ul>
          </div>

          {/* Legal Notice */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Provenance & Legal Note</h4>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-[11px] text-slate-400 leading-relaxed">
              Cryptographic SHA-256 fingerprints provide immutable proof of content submission time. They document prior art under open-source hardware conventions, but do not replace state patent filings.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Rural Innovation Hub Foundation. Built for sustainable rural progress.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0 text-slate-400">
            <span>Powered by Frugal Engineering & Solar Resilience</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
