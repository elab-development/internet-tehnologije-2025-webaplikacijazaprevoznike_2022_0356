import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('SUPPLIER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getRegisterErrorMessage = (res, data) => {
    if (res.status === 400) return 'Please fill in all required fields (email, password, name and role).';
    if (res.status === 409 || data?.code === 'EMAIL_TAKEN') return 'An account with this email already exists.';
    return data?.message || 'Registration failed. Please try again.';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !name) {
      setError('Please fill in email, password and name.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getRegisterErrorMessage(res, data));
        return;
      }
      navigate('/login', { state: { message: 'Account created. You can log in now.' } });
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Register</h1>
      <p>Create an account to access the platform.</p>

      <form
        onSubmit={handleRegister}
        style={{
          marginTop: '2rem',
          maxWidth: '450px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {error && (
          <div className="form-group" style={{ color: '#dc3545', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="reg-email">Email:</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Password:</label>
          <div className="password-input-wrap">
            <input
              id="reg-password"
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
        <div className="form-group">
          <label htmlFor="reg-name">Name:</label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-role">Role:</label>
          <select id="reg-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="SUPPLIER">Supplier</option>
            <option value="IMPORTER">Importer</option>
          </select>
        </div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!email || !password || !name || loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </Button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
