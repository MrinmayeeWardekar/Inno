import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const token = params.get('token');
    const userData = params.get('user');
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        loginWithToken(user, token);
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'tutor') navigate('/tutor');
        else navigate('/dashboard');
      } catch { navigate('/login'); }
    } else navigate('/login');
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>⚡</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Signing you in...</p>
      </div>
    </div>
  );
}
