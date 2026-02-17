import React, { useEffect, useState } from 'react';
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
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../utils/apiClient';

const STATUS_COLORS = { PENDING: '#f0ad4e', APPROVED: '#5cb85c', REJECTED: '#d9534f' };
const PIE_COLORS = ['#4a90d9', '#7ed56f', '#ff6b6b', '#feca57', '#a55eea', '#45aaf2'];

export default function StatsPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load statistics');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load statistics'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <ProtectedLayout><div className="page"><p>Loading statistics…</p></div></ProtectedLayout>;
  if (error) {
    return (
      <ProtectedLayout>
        <div className="page" style={{ padding: '1.5rem' }}>
          <div style={{ color: '#721c24', padding: '0.75rem', background: '#f8d7da', borderRadius: '6px' }}>
            {error}
          </div>
        </div>
      </ProtectedLayout>
    );
  }
  if (!data) return null;

  const { collaborationsByStatus, productsByCategory, totals } = data;
  const collaborationBars = [
    { name: 'Pending', count: collaborationsByStatus.PENDING ?? 0, fill: STATUS_COLORS.PENDING },
    { name: 'Approved', count: collaborationsByStatus.APPROVED ?? 0, fill: STATUS_COLORS.APPROVED },
    { name: 'Rejected', count: collaborationsByStatus.REJECTED ?? 0, fill: STATUS_COLORS.REJECTED },
  ];
  const categoryBars = (productsByCategory || []).map((c, i) => ({
    name: c.categoryName,
    count: c.count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const collaborationPie = Object.entries(collaborationsByStatus || {}).map(([status, count], i) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase(),
    value: count,
    fill: STATUS_COLORS[status] || PIE_COLORS[i],
  })).filter((d) => d.value > 0);

  return (
    <ProtectedLayout>
      <div className="page" style={{ padding: '1.5rem' }}>
        <h1>Statistics &amp; visualization</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Overview of collaborations, products by category, and totals.
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Totals</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <StatCard label="Users" value={totals?.users ?? 0} />
            <StatCard label="Products" value={totals?.products ?? 0} />
            <StatCard label="Containers" value={totals?.containers ?? 0} />
            <StatCard label="Collaborations" value={totals?.collaborations ?? 0} />
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Collaborations by status</h2>
          <div style={{ width: '100%', maxWidth: 480, height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collaborationBars} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]} />
                {collaborationBars.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {collaborationPie.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Collaborations (pie)</h2>
            <div style={{ width: '100%', maxWidth: 360, height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collaborationPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {collaborationPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Products by category</h2>
          <div style={{ width: '100%', maxWidth: 560, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBars}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={72} />
                <Tooltip />
                <Bar dataKey="count" name="Products" radius={[0, 4, 4, 0]}>
                  {categoryBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </ProtectedLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        minWidth: 120,
        padding: '1rem 1.25rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#333' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}
