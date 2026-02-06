import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (username && password) {
      // Generate mock token (in real app, this would come from API)
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save token and role in localStorage
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userRole', role);
      
      // Navigate to dashboard with role
      navigate('/dashboard', { state: { role } });
    } else {
      alert('Please enter username and password');
    }
  };

  return (
    <div className="page">
      <h1>Login Page</h1>
      <p>Please log in to access your dashboard.</p>
      
      <form onSubmit={handleLogin} style={{ 
        marginTop: '2rem', 
        maxWidth: '450px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div className="form-group">
          <label htmlFor="username">
            Username:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">
            Role:
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="supplier">Supplier</option>
            <option value="importer">Importer</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!username || !password}
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
