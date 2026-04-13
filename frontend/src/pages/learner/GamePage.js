import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GamePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{ padding: '14px 28px', background: 'rgba(7,5,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>← Dashboard</button>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>🎮 DBMS Quest — Campus Heist</span>
          <span style={{ marginLeft: 12, padding: '3px 10px', background: 'rgba(45,224,142,0.1)', color: 'var(--green)', border: '1px solid rgba(45,224,142,0.2)', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Bonus Game</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Playing as: <strong style={{ color: 'var(--violet-bright)' }}>{user?.name}</strong></span>
      </div>

      {/* Game iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src="/game/index.html"
          title="DBMS Quest - Campus Heist"
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 'calc(100vh - 65px)', display: 'block' }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
