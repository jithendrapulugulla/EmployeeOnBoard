import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar" style={{ padding: '8px 0' }}>
      <div className="container" style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* WinWire Logo */}
          <div style={{
            background: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <img 
              src="/images/image.png" 
              alt="WinWire Logo"
              style={{
                height: '36px',
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#E8F0F7',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Employee Onboarding
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: '500',
              color: '#A8D0E6',
              letterSpacing: '0.5px'
            }}>
              Official Portal
            </span>
          </div>
        </div>

        <div className="user-info">
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              {user.fullName}
            </p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.85 }}>
              {user.role === 'admin' ? '👨‍💼 Administrator' : '👤 Employee'}
            </p>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
