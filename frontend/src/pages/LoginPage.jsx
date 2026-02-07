import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const successMessage = location.state?.message;

  const getLoginErrorMessage = (res, data) => {
    if (res.status === 400) return 'Please enter email and password.';
    if (res.status === 401) return 'Invalid email or password.';
    if (data?.code === 'UNAUTHORIZED') return 'Invalid or expired session. Please log in again.';
    return data?.message || 'Login failed. Please try again.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getLoginErrorMessage(res, data));
        return;
      }
      const userRoleFromApi = data.user?.role;
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', (userRoleFromApi || '').toLowerCase());
      navigate('/dashboard', { state: { role: (userRoleFromApi || '').toLowerCase() } });
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Login Page</h1>
      <p>Please log in to access your dashboard.</p>
      {successMessage && (
        <p style={{ color: '#155724', backgroundColor: '#d4edda', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {successMessage}
        </p>
      )}
      {error && (
        <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </p>
      )}
      <form onSubmit={handleLogin} style={{ 
        marginTop: '2rem', 
        maxWidth: '450px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div className="form-group">
          <label htmlFor="email">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password:
          </label>
          <div className="password-input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!email || !password || loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
