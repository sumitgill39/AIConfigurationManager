import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:18080/api';

const ConfigurationManager = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Using memory storage instead of localStorage
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (currentView === 'dashboard') {
          fetchAnalytics();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    }
  };

  // Fetch dashboard analytics
  const fetchAnalytics = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // Login function
  const handleLogin = async (username, password) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        setUser(data.user);
        setCurrentView('dashboard');
        fetchAnalytics();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const handleRegister = async (username, email, password, role = 'user') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        setError('Registration successful! Please login.');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setAnalytics(null);
    setCurrentView('login');
  };

  // Test backend connection
  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      alert(`✅ Backend Status: ${data.status}\n🚀 Service: ${data.service}`);
    } catch (error) {
      alert('❌ Backend connection failed!');
    }
  };

  // Login/Register Form Component
  const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isLogin) {
        handleLogin(formData.username, formData.password);
      } else {
        handleRegister(formData.username, formData.email, formData.password, formData.role);
      }
    };

    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={{ margin: 0, color: '#666' }}>AI Configuration Manager</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Username
              </label>
              <input
                type="text"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                type="password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Role
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {error && (
              <div style={{
                background: error.includes('successful') ? '#d4edda' : '#fee',
                border: `1px solid ${error.includes('successful') ? '#4caf50' : '#f00'}`,
                color: error.includes('successful') ? '#155724' : '#c00',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#bdc3c7' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ username: '', email: '', password: '', role: 'user' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={testConnection}
              style={{
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Test Backend Connection
            </button>
          </div>

          <div style={{ 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>🔑 Backend Credentials:</strong><br/>
            <div style={{ marginTop: '8px' }}>
              Create an account or use existing credentials<br/>
              from your backend database
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic' }}>
              ✅ Connected to real backend API
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>Dashboard</h2>
        
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          {[
            { 
              title: 'Total Configurations', 
              value: analytics?.summary?.total_configurations || 0, 
              icon: '⚙️',
              color: '#3498db'
            },
            { 
              title: 'Applications', 
              value: analytics?.summary?.total_applications || 0, 
              icon: '📱',
              color: '#27ae60'
            },
            { 
              title: 'High Risk Items', 
              value: analytics?.summary?.sensitivity_distribution?.high || 0, 
              icon: '🔴',
              color: '#e74c3c'
            },
            { 
              title: 'Environments', 
              value: Object.keys(analytics?.summary?.environments || {}).length, 
              icon: '🌍',
              color: '#9b59b6'
            }
          ].map((stat) => (
            <div key={stat.title} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${stat.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    {stat.title}
                  </div>
                </div>
                <div style={{ fontSize: '30px' }}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Recent Activity</h3>
          {analytics?.recent_activity?.length > 0 ? (
            <div>
              {analytics.recent_activity.map((activity) => (
                <div key={activity.id} style={{
                  padding: '10px 0',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{activity.action.replace('_', ' ')}</strong>
                    {activity.configuration && ` - ${activity.configuration}`}
                  </div>
                  <small style={{ color: '#666' }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No recent activity</p>
          )}
        </div>

        {/* Connection Status */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e8f5e8',
          borderRadius: '8px',
          border: '1px solid #4caf50'
        }}>
          <p style={{ margin: 0, color: '#2e7d32' }}>
            ✅ <strong>System Status:</strong> Connected to real backend API at localhost:18080
          </p>
        </div>
      </div>
    );
  };

  // Main App Layout
  if (!token || !user) {
    return <AuthForm />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>🤖 AI Config Manager</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>Welcome, {user.username}</div>
            <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
              {user.role}
            </div>
          </div>
          <button 
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          background: 'white',
          minHeight: 'calc(100vh - 73px)',
          padding: '20px 0',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}>
          <nav>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'configurations', label: 'Configurations', icon: '⚙️' },
              { id: 'applications', label: 'Applications', icon: '📱' },
              { id: 'audit', label: 'Audit Logs', icon: '📋' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (item.id === 'dashboard') {
                    fetchAnalytics();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  border: 'none',
                  background: currentView === item.id ? '#e3f2fd' : 'transparent',
                  color: currentView === item.id ? '#1976d2' : '#666',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '24px' }}>
          {currentView === 'dashboard' && <Dashboard />}
          
          {currentView !== 'dashboard' && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '16px', textTransform: 'capitalize' }}>
                {currentView}
              </h2>
              <div style={{
                background: '#fff3cd',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}>
                <p style={{ margin: 0, color: '#856404' }}>
                  🚧 <strong>{currentView.charAt(0).toUpperCase() + currentView.slice(1)} section is under development.</strong>
                  <br />
                  The backend API is ready and this section will be implemented next.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ConfigurationManager;