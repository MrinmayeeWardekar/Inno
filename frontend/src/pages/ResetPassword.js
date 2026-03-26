import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { id, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${id}/${token}`, { password });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 48, backdropFilter: 'blur(20px)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Reset password</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Enter your new password below.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" required minLength={8} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}
