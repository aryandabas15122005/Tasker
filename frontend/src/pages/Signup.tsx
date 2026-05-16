import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left decorative panel */}
      <div style={{ 
        width: '420px', 
        background: 'linear-gradient(160deg, #133430, #0f766e)', 
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(232,117,55,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', padding: '1rem', 
            background: 'linear-gradient(135deg, var(--accent), #c55f2b)', 
            borderRadius: '16px', marginBottom: '2rem'
          }}>
            <Target size={40} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>Tasker</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '280px' }}>
            Join your team and start collaborating on projects today.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
            Create Account
          </h2>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
            Fill in your details to get started.
          </p>
          
          {error && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(214, 69, 69, 0.08)', borderLeft: '3px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="animate-fade-in">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
            </div>
            <div className="input-group">
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
