import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login({ email, password });
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '40px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* WinWire Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              display: 'inline-flex'
            }}>
              <img 
                src="/images/image.png" 
                alt="WinWire Logo"
                style={{
                  maxHeight: '50px',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
          
          <h2 style={{
            color: '#124B84',
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
            fontFamily: "'Raleway', sans-serif"
          }}>
            Employee Onboarding
          </h2>
          <p style={{
            color: '#666',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '0',
            fontFamily: "'Raleway', sans-serif"
          }}>
            Official Portal | Secure Login
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error" style={{ fontSize: '13px' }}>⚠️ {error}</div>}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '24px', padding: '12px', fontSize: '15px', fontWeight: '700' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #EEE',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: '#999',
            margin: '0',
            fontFamily: "'Raleway', sans-serif",
            fontWeight: '500'
          }}>
            © 2025 WinWire. All rights reserved.
          </p>
          <p style={{
            fontSize: '11px',
            color: '#BBB',
            margin: '4px 0 0 0',
            fontFamily: "'Raleway', sans-serif"
          }}>
            Secure Employee Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
