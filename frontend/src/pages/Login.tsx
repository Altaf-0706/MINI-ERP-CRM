import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn, Mail, Lock, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@minierp.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const setDemoCredentials = (role: string) => {
    setEmail(`${role}@minierp.com`);
    setPassword(`${role}123`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Left Side: Hero / Brand Graphic */}
        <div className="login-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' }}>
            <Zap size={32} color="#fff" fill="#fff" />
            <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '1px' }}>MINI ERP CRM</span>
          </div>
          
          <div>
            <h2>Manage your business.<br/>Simplify your operations.</h2>
            <p>A complete operations portal for managing customers, products, inventory, and sales challans — all in one place.</p>
          </div>
          
          <div style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></div>
            <div style={{ width: '32px', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,1)' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></div>
          </div>
        </div>
        
        {/* Right Side: Glass Login Form */}
        <div className="login-form-wrapper">
          <div style={{ marginBottom: '32px' }}>
            <h1>Welcome back</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Enter your credentials to access your workspace.</p>
          </div>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label className="glass-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.4)' }} />
                <input 
                  type="email" 
                  className="glass-input" 
                  style={{ paddingLeft: '44px' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label className="glass-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.4)' }} />
                <input 
                  type="password" 
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn-glass" disabled={loading}>
              {loading ? 'Authenticating...' : (
                <>
                  Sign In <LogIn size={18} />
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: '32px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            <p style={{ marginBottom: '12px' }}>Login as:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setDemoCredentials('admin')} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>Admin</button>
              <button type="button" onClick={() => setDemoCredentials('sales')} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>Sales</button>
              <button type="button" onClick={() => setDemoCredentials('distributor')} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>Distributor</button>
              <button type="button" onClick={() => setDemoCredentials('wholesale')} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>Wholesale</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;

