import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const check = (p) => ({ length: p.length >= 8, upper: /[A-Z]/.test(p), lower: /[a-z]/.test(p), number: /[0-9]/.test(p), special: /[^A-Za-z0-9]/.test(p) });

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'learner' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const checks = check(form.password);
  const score = Object.values(checks).filter(Boolean).length;
  const strengthColor = ['', '#ff6060', '#f6ad55', '#ffd700', '#2de08e', '#9d7fd4'][score];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Perfect'][score];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (score < 5) return toast.error('Please meet all password requirements');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to InnoVenture 🚀');
      navigate(form.role === 'tutor' ? '/tutor' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const inp = { width: '100%', padding: '13px 16px', background: 'rgba(20,16,34,0.8)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 12, color: 'white', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(123,94,167,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,94,167,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '10%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,94,167,0.1), transparent)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'float 7s ease-in-out infinite' }} />

      {/* Left panel */}
      <div style={{ width: '40%', background: 'linear-gradient(135deg, rgba(123,94,167,0.06), rgba(0,212,255,0.03))', borderRight: '1px solid rgba(123,94,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 5s ease-in-out infinite', display: 'inline-block' }}>🎮</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 14, letterSpacing: '-0.5px' }}>Your adventure<br />starts here</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 280, margin: '0 auto 36px' }}>Every expert was once a beginner. Take your first step today.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['⭐', '+50 XP', 'Just for joining'], ['🎯', 'Level 1', 'Start your journey'], ['🏅', 'First Badge', 'Complete a lesson'], ['🔴', 'Go Live', 'Join a live class']].map(([icon, label, desc], i) => (
              <div key={i} style={{ padding: '16px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--cyan)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 480, paddingBottom: 40, animation: 'slide-up 0.6s ease forwards' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 36, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>← Back</Link>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              <span style={{ color: 'white' }}>Inno</span><span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-1px', marginBottom: 6 }}>Create your account 🎮</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Earn your first 50 XP today — just by joining.</p>
          </div>

          {/* Google */}
          <a href="https://innoventure-backend.onrender.com/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '13px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, marginBottom: 24, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(157,127,212,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'var(--text-dim)', fontSize: 12, fontWeight: 600 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[{ v: 'learner', icon: '🎓', label: 'I want to Learn', desc: 'Earn XP, take courses' }, { v: 'tutor', icon: '👨‍🏫', label: 'I want to Teach', desc: 'Create courses, earn money' }].map(r => (
              <div key={r.v} onClick={() => setForm({ ...form, role: r.v })}
                style={{ padding: '16px', borderRadius: 14, border: `2px solid ${form.role === r.v ? 'var(--violet-bright)' : 'rgba(255,255,255,0.07)'}`, background: form.role === r.v ? 'rgba(123,94,167,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.role === r.v ? 'var(--violet-bright)' : 'var(--text-muted)', marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[{ label: 'FULL NAME', key: 'name', type: 'text', ph: 'Your full name' }, { label: 'EMAIL', key: 'email', type: 'email', ph: 'you@example.com' }].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{f.label}</label>
                <input style={inp} type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                  onFocus={e => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: 48 }} type={showPass ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  onFocus={e => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 15, padding: 0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${score * 20}%`, height: '100%', background: strengthColor, borderRadius: 99, transition: 'all 0.4s' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor, minWidth: 48 }}>{strengthLabel}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    {[['length', '8+ characters'], ['upper', 'A-Z'], ['lower', 'a-z'], ['number', '0-9'], ['special', '!@#$']].map(([k, l]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: checks[k] ? 'rgba(45,224,142,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${checks[k] ? 'rgba(45,224,142,0.25)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.2s' }}>
                        <span style={{ fontSize: 10, color: checks[k] ? 'var(--green)' : 'var(--text-dim)' }}>{checks[k] ? '✓' : '○'}</span>
                        <span style={{ fontSize: 10, color: checks[k] ? 'var(--green)' : 'var(--text-dim)', fontWeight: checks[k] ? 600 : 400 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {form.role === 'tutor' && (
              <div style={{ padding: '12px 14px', background: 'rgba(240,192,64,0.06)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--gold)' }}>
                ⏳ Tutor accounts need admin approval before going live.
              </div>
            )}

            <button type="submit" disabled={loading || score < 5} style={{ padding: '14px', background: score >= 5 ? 'linear-gradient(135deg, #7b5ea7, #e8547a)' : 'rgba(123,94,167,0.3)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: score >= 5 ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', boxShadow: score >= 5 ? '0 4px 24px rgba(123,94,167,0.4)' : 'none', transition: 'all 0.2s', marginTop: 4 }}>
              {loading ? 'Creating...' : `Join as ${form.role === 'tutor' ? 'Tutor' : 'Learner'} 🚀`}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--violet-bright)', textDecoration: 'none', fontWeight: 700 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
