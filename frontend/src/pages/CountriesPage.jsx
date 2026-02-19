import React, { useEffect, useState } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';

export default function CountriesPage() {
  const { token } = useAuth(); // not strictly needed but keeps pattern
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Call REST Countries API directly from the browser, limited fields to avoid 400
    fetch('https://restcountries.com/v3.1/all?fields=cca2,name,capital,region,timezones,currencies')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load countries');
        return res.json();
      })
      .then((raw) => {
        const mapped = (raw || [])
          .filter((c) => c && c.cca2 && c.name && c.name.common)
          .map((c) => {
            const currencies = c.currencies
              ? Object.entries(c.currencies).map(([code, val]) => ({
                  code,
                  name: val.name,
                  symbol: val.symbol ?? null,
                }))
              : [];
            return {
              code: c.cca2,
              name: c.name.common,
              capital: Array.isArray(c.capital) && c.capital.length ? c.capital[0] : null,
              timezones: Array.isArray(c.timezones) ? c.timezones : [],
              region: c.region ?? null,
              currencies,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load countries');
        setCountries([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedLayout>
      <div className="page" style={{ padding: '1.5rem' }}>
        <h1>Countries (REST Countries)</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Informational list of countries with capital, region, timezones and currencies.
        </p>

        {error && (
          <div style={{ color: '#721c24', marginBottom: '1rem', padding: '0.75rem', background: '#f8d7da', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading countries…</p>
        ) : countries.length === 0 ? (
          <p style={{ color: '#666' }}>No countries found.</p>
        ) : (
          <div style={{ maxHeight: '60vh', overflow: 'auto', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa' }}>
                <tr>
                  <th style={cellHeaderStyle}>Code</th>
                  <th style={cellHeaderStyle}>Name</th>
                  <th style={cellHeaderStyle}>Region</th>
                  <th style={cellHeaderStyle}>Capital</th>
                  <th style={cellHeaderStyle}>Timezones</th>
                  <th style={cellHeaderStyle}>Currencies</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c) => (
                  <tr key={c.code}>
                    <td style={cellStyle}>{c.code}</td>
                    <td style={cellStyle}>{c.name}</td>
                    <td style={cellStyle}>{c.region || '—'}</td>
                    <td style={cellStyle}>{c.capital || '—'}</td>
                    <td style={cellStyle}>{(c.timezones || []).join(', ') || '—'}</td>
                    <td style={cellStyle}>
                      {(c.currencies || [])
                        .map((cur) => `${cur.code}${cur.symbol ? ` (${cur.symbol})` : ''}`)
                        .join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

const cellHeaderStyle = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #dee2e6',
  position: 'sticky',
  top: 0,
  backgroundColor: '#f8f9fa',
  zIndex: 1,
};

const cellStyle = {
  padding: '0.4rem 0.75rem',
  borderBottom: '1px solid #f1f3f5',
};

