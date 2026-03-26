import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 48, backdropFilter: 'blur(20px)' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📧</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Check your inbox</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>We sent a password reset link to <strong style={{ color: 'white' }}>{email}</strong></p>
            <Link to="/login" style={{ color: 'var(--violet-bright)', textDecoration: 'none', fontWeight: 700 }}>← Back to login</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Forgot password?</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No worries, we'll send you a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
              <Link to="/login" style={{ color: 'var(--violet-bright)', textDecoration: 'none', fontWeight: 700 }}>← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
