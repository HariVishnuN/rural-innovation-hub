import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Leaf, Droplets, Lightbulb, Users, Award, TrendingUp, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/Button';

const COLORS = ['#0D9488', '#0284C7', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/analytics/overview')
      .then((res) => setData(res.data))
      .catch((e) => console.warn('Analytics fetch error', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading ESG impact metrics & data...</div>;
  }

  const { impact_summary, categories, state_distribution, esg_summary } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform ESG & Diffusion Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time SQL aggregates measuring open hardware adoption, rural capital savings, and environmental protection.
        </p>
      </div>

      {/* Top 4 Impact Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">
                {(parseFloat(impact_summary.total_co2_saved_kg) / 1000).toFixed(1)} Tonnes
              </div>
              <div className="text-xs text-slate-500">CO₂ Avoided</div>
            </div>
          </div>
        </Card>

        <Card className="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">
                {(parseFloat(impact_summary.total_water_saved_liters) / 1000).toFixed(1)} kL
              </div>
              <div className="text-xs text-slate-500">Water Conserved</div>
            </div>
          </div>
        </Card>

        <Card className="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">
                ₹{esg_summary.rural_capital_saved_estimate_inr.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Rural Capital Saved</div>
            </div>
          </div>
        </Card>

        <Card className="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">
                {esg_summary.open_hardware_diffusion_index}x
              </div>
              <div className="text-xs text-slate-500">Diffusion Index</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Inventions by Category */}
        <Card className="p-5 space-y-4" hover={false}>
          <h3 className="text-sm font-bold text-slate-900">Inventions by Sector Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: State Diffusion & Replications */}
        <Card className="p-5 space-y-4" hover={false}>
          <h3 className="text-sm font-bold text-slate-900">Inventions vs. Community Replications by State</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="state" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="inventions_count" name="Published Blueprints" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replications_count" name="Verified Builds" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
