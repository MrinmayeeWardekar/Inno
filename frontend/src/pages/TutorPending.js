import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function TutorPending() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    if (user?.role === 'tutor' && user?.tutorStatus === 'approved') navigate('/tutor');
    if (user?.role === 'learner') navigate('/dashboard');
  }, [user, navigate]);

  const isRejected = user?.tutorStatus === 'rejected';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: 'float 4s ease-in-out infinite', display: 'inline-block' }}>
          {isRejected ? '😔' : '⏳'}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          {isRejected ? 'Application Not Approved' : 'Application Under Review'}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          {isRejected
            ? 'Your tutor application was not approved this time.'
            : 'Our admin team is reviewing your documents. This usually takes 24–48 hours. You will receive an email once a decision is made.'}
        </p>

        {isRejected && user?.tutorRejectionReason && (
          <div style={{ background: 'rgba(252,129,129,0.06)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ color: '#fc8181', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>REASON</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>{user.tutorRejectionReason}</div>
          </div>
        )}

        {!isRejected && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
            {[['📄', 'Documents', 'Submitted'], ['🔍', 'Review', 'In progress'], ['✅', 'Decision', 'Pending']].map(([icon, label, status], i) => (
              <div key={i} style={{ padding: '16px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{status}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {isRejected && (
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Re-apply →
            </button>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}