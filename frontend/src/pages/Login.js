import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🚀`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'tutor') navigate('/tutor');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const demos = [
    { label: '🛡️ Admin', email: 'admin@innoventure.com', pass: 'Admin@123' },
    { label: '👨‍🏫 Tutor', email: 'varsha123@gmail.com', pass: 'Varsha@123' },
    { label: '🎓 Learner', email: 'mrinnn06@gmail.com', pass: 'Mrin@1234' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(123,94,167,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,94,167,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,94,167,0.1), transparent)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,84,122,0.08), transparent)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'float 6s ease-in-out 2s infinite' }} />

      {/* Left - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'slide-up 0.6s ease forwards' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
            ← Back to home
          </Link>

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              <span style={{ color: 'white' }}>Inno</span>
              <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8, color: 'white' }}>Welcome back 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Your XP awaits. Continue your journey.</p>
          </div>

          {/* Google */}
          <a href="http://https://innoventure-backend.onrender.com/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, marginBottom: 24, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(157,127,212,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'var(--text-dim)', fontSize: 12, fontWeight: 600 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--violet-bright)', textDecoration: 'none', fontWeight: 600 }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '14px', background: loading ? 'rgba(123,94,167,0.4)' : 'linear-gradient(135deg, #7b5ea7, #e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'default' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: loading ? 'none' : '0 4px 24px rgba(123,94,167,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(123,94,167,0.5)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 24px rgba(123,94,167,0.4)'; }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            New here? <Link to="/register" style={{ color: 'var(--violet-bright)', textDecoration: 'none', fontWeight: 700 }}>Create account →</Link>
          </p>

          {/* Demo */}
          <div style={{ marginTop: 28, padding: '20px', background: 'rgba(123,94,167,0.06)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>⚡ Quick Demo</div>
            {demos.map((d, i) => (
              <div key={i} onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 6, fontSize: 13, cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,94,167,0.1)'; e.currentTarget.style.borderColor = 'rgba(123,94,167,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                <span style={{ fontWeight: 700, color: 'white' }}>{d.label}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{d.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '45%', background: 'linear-gradient(135deg, rgba(123,94,167,0.06), rgba(232,84,122,0.04))', borderLeft: '1px solid rgba(123,94,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 88, marginBottom: 24, animation: 'float 5s ease-in-out infinite', display: 'inline-block' }}>🚀</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, marginBottom: 14, letterSpacing: '-0.5px' }}>Level up your<br />skills today</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 300, margin: '0 auto 40px' }}>Join thousands of learners earning XP and mastering real-world skills.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['⭐', 'Earn XP every lesson'], ['🏆', 'Climb the leaderboard'], ['🎓', 'Download certificates'], ['🤖', 'AI learning assistant']].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
