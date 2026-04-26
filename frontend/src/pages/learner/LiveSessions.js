import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const SOCKET_URL = 'https://innoventure-backend.onrender.com';

export default function LiveSessions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    API.get('/live/sessions').then(r => { setSessions(Array.isArray(r.data) ? r.data : []); setLoading(false); }).catch(() => setLoading(false));

    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('joinNotifications', user?._id);
    socketRef.current.on('liveSessionStarted', (data) => {
      setNotification(data);
      toast.custom((t) => (
        <div style={{ background: 'rgba(14,11,26,0.98)', border: '1px solid rgba(255,0,0,0.4)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', maxWidth: 380 }}>
          <span style={{ fontSize: 26 }}>🔴</span>
          <div>
            <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>Live session started!</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.tutorName}: {data.sessionTitle}</div>
          </div>
        </div>
      ), { duration: 8000 });
      API.get('/live/sessions').then(r => setSessions(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    });

    return () => socketRef.current?.disconnect();
  }, [user?._id]);

  const joinRoom = (roomId) => {
    navigate(`/live/room/${roomId}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'rgba(7,5,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 0', flexShrink: 0, backdropFilter: 'blur(20px)' }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: 'white' }}>Inno</span><span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
          </div>
        </div>
        {[{ icon: '⚡', label: 'Dashboard', path: user?.role === 'tutor' ? '/tutor' : '/dashboard' }, { icon: '📚', label: 'Courses', path: '/courses' }, { icon: '🔴', label: 'Live Sessions', path: '/live' }].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', color: item.path === '/live' ? 'var(--pink)' : 'var(--text-muted)', background: item.path === '/live' ? 'rgba(232,84,122,0.08)' : 'transparent', fontWeight: 600, fontSize: 14, transition: 'all 0.15s' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, padding: '0 12px' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>
            🔴 Live Sessions
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Join live classes from expert tutors in real-time</p>
        </div>

        {/* Live alert banner */}
        {sessions.filter(s => s.isLive).length > 0 && (
          <div style={{ padding: '16px 24px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 18, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, animation: 'pulse-glow 2s ease-in-out infinite' }}>
            <span style={{ fontSize: 24, animation: 'pulse-glow 1.5s ease-in-out infinite' }}>🔴</span>
            <div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>{sessions.filter(s => s.isLive).length} session{sessions.filter(s => s.isLive).length > 1 ? 's' : ''} happening right now!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Join now before it ends</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 20 }} />)}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(14,11,26,0.5)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 28 }}>
            <div style={{ fontSize: 72, marginBottom: 20, animation: 'float 4s ease-in-out infinite', display: 'inline-block' }}>🎙️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No live sessions right now</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Check back soon — tutors go live every day!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {sessions.map(session => (
              <div key={session._id} style={{ background: 'rgba(14,11,26,0.8)', border: `1.5px solid ${session.status === 'live' ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 22, overflow: 'hidden', position: 'relative', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = session.status === 'live' ? '0 16px 48px rgba(255,80,80,0.15)' : '0 16px 48px rgba(123,94,167,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {session.status === 'live' && (
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(220,30,30,0.9)', borderRadius: 99, fontSize: 12, fontWeight: 800, color: 'white', backdropFilter: 'blur(8px)', zIndex: 1 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', display: 'inline-block', animation: 'pulse-glow 1s infinite' }} />
                    LIVE
                  </div>
                )}
                <div style={{ height: 140, background: session.status === 'live' ? 'linear-gradient(135deg, rgba(200,30,30,0.25), rgba(232,84,122,0.15))' : 'linear-gradient(135deg, rgba(123,94,167,0.2), rgba(7,5,15,0.8))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>
                  🎙️
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.3 }}>{session.title || 'Live Session'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e8547a,#f0c040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'white' }}>
                      {session.tutor?.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>{session.tutor?.name}</strong></span>
                    {session.viewers > 0 && <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 'auto' }}>👥 {session.viewers}</span>}
                  </div>
                  {session.status === 'live' ? (
                    <button onClick={() => joinRoom(session.roomId || session._id)} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #cc1f1f, #e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(200,30,30,0.4)', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.target.style.boxShadow = '0 8px 32px rgba(200,30,30,0.5)'}
                      onMouseLeave={e => e.target.style.boxShadow = '0 4px 20px rgba(200,30,30,0.4)'}>
                      🔴 Join Live Now
                    </button>
                  ) : (
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, textAlign: 'center', fontSize: 13, color: 'var(--text-dim)' }}>
                      Session ended
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
