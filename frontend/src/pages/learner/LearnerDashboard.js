import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import RecommendedCourses from "../../components/RecommendedCourses";

const Avatar = ({ name, size = 40, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #7b5ea7, #e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 900, color: 'white', flexShrink: 0, fontFamily: 'var(--font-display)', ...style }}>
    {name?.[0]?.toUpperCase()}
  </div>
);

const XPRing = ({ xp, level }) => {
  const percent = ((xp % 500) / 500) * 100;
  const r = 54; const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="url(#xpGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * percent / 100)} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7b5ea7" />
            <stop offset="100%" stopColor="#e8547a" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #9d7fd4, #e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lv.{level}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{xp % 500}/500 XP</div>
      </div>
    </div>
  );
};

const categoryEmoji = (c) => ({ Technology: '💻', Music: '🎵', Language: '🌍', Design: '🎨', Business: '💼', Art: '🖌️', Science: '🔬' })[c] || '📚';

export default function LearnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('home');
  const [leaderboard, setLeaderboard] = useState([]);
  const [progress, setProgress] = useState([]);
  const [courses, setCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    API.get('/users/leaderboard').then(r => setLeaderboard(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/users/progress').then(r => setProgress(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/courses').then(r => setCourses(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/live').then(r => setLiveSessions(Array.isArray(r.data) ? r.data : [])).catch(() => {});

    const socket = io('http://localhost:5001');
    socket.on('session-started', (data) => {
      toast.success(`🔴 ${data.tutorName} just went live: "${data.title}"`, { duration: 5000 });
      API.get('/live').then(r => setLiveSessions(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    });
    return () => socket.disconnect();
  }, []);

  const xpToNext = 500 - ((user?.xp || 0) % 500);
  const enrolledIds = progress.map(p => p.course?._id);

  const filteredCourses = courses.filter(c => {
    const matchCat = filterCat === 'All' || c.category === filterCat;
    const matchSearch = c.title?.toLowerCase().includes(searchQ.toLowerCase()) || c.tutor?.name?.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchSearch;
  });

  const nav = [
    { id: 'home', icon: '⚡', label: 'Dashboard' },
    { id: 'courses', icon: '📚', label: 'Courses' },
    { id: 'live', icon: '🔴', label: 'Live Sessions' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { id: 'progress', icon: '📈', label: 'My Progress' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ];

  const StatCard = ({ icon, label, value, color, bg, sub }) => (
    <div style={{ padding: '24px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: bg, filter: 'blur(20px)' }} />
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07060f' }}>

      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? 72 : 260, background: 'rgba(7,5,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '24px 0', transition: 'width 0.3s ease', position: 'fixed', top: 0, left: 0, bottom: 0, flexShrink: 0, backdropFilter: 'blur(20px)', zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <span style={{ color: 'white' }}>Inno</span>
              <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '8px', borderRadius: 8, fontSize: 12, lineHeight: 1, marginLeft: 'auto' }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {nav.map(item => (
            <div key={item.id} onClick={() => item.id === 'profile' ? navigate('/profile') : setTab(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 4, cursor: 'pointer', transition: 'all 0.15s', background: tab === item.id ? 'rgba(123,94,167,0.2)' : 'transparent', color: tab === item.id ? '#9d7fd4' : 'rgba(255,255,255,0.4)', border: `1px solid ${tab === item.id ? 'rgba(123,94,167,0.3)' : 'transparent'}`, overflow: 'hidden' }}
              onMouseEnter={e => { if (tab !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}}
              onMouseLeave={e => { if (tab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
          {!sidebarCollapsed ? (
            <div style={{ padding: '14px 16px', background: 'rgba(123,94,167,0.08)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={user?.name} size={36} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Lv.{user?.level || 1} · <span style={{ color: '#ffd700' }}>{user?.xp || 0} XP</span></div>
                </div>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(((user?.xp || 0) % 500) / 500 * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#7b5ea7,#e8547a)', borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>{xpToNext} XP to next level</div>
            </div>
          ) : <Avatar name={user?.name} size={44} style={{ margin: '0 auto 10px' }} />}
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: sidebarCollapsed ? '10px 0' : '10px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>🚪</span>{!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '40px 48px', marginLeft: sidebarCollapsed ? 72 : 260, transition: 'margin-left 0.3s ease' }}>

        {/* HOME TAB */}
        {tab === 'home' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Welcome back</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>
                  <span style={{ background: 'linear-gradient(135deg, #9d7fd4, #e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Keep learning and climbing the leaderboard!</p>
              </div>
              <XPRing xp={user?.xp || 0} level={user?.level || 1} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
              <StatCard icon="⭐" label="Total XP" value={user?.xp || 0} color="#ffd700" bg="rgba(240,192,64,0.15)" sub={`${xpToNext} XP to Lv.${(user?.level || 1) + 1}`} />
              <StatCard icon="🎯" label="Level" value={user?.level || 1} color="#9d7fd4" bg="rgba(123,94,167,0.2)" sub="Keep grinding!" />
              <StatCard icon="📚" label="Enrolled" value={progress.length} color="#00d4ff" bg="rgba(0,212,255,0.15)" sub="courses active" />
              <StatCard icon="🏅" label="Badges" value={user?.badges?.length || 0} color="#2de08e" bg="rgba(45,224,142,0.15)" sub="earned so far" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              {/* Leaderboard preview */}
              <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>🏆 Top Learners</h3>
                  <button onClick={() => setTab('leaderboard')} style={{ fontSize: 12, color: '#9d7fd4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>See all →</button>
                </div>
                {leaderboard.slice(0, 5).map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, background: i === 0 ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                    </div>
                    <Avatar name={u.name} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Level {u.level}</div>
                    </div>
                    <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 14 }}>{u.xp} XP</div>
                  </div>
                ))}
                {leaderboard.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No data yet — you could be #1! 🚀</p>}
              </div>

              {/* My courses */}
              <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>📈 My Courses</h3>
                  <button onClick={() => setTab('courses')} style={{ fontSize: 12, color: '#9d7fd4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Browse →</button>
                </div>
                {progress.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 14 }}>No courses yet!</p>
                    <button onClick={() => setTab('courses')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>Browse Courses</button>
                  </div>
                ) : progress.map((p, i) => (
                  <div key={i} style={{ marginBottom: 14, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}
                    onClick={() => navigate(`/courses/${p.course?._id}`)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,94,167,0.08)'; e.currentTarget.style.borderColor = 'rgba(123,94,167,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'white' }}>{p.course?.title}</div>
                      <div style={{ fontSize: 13, color: '#2de08e', fontWeight: 800 }}>{p.percentComplete}%</div>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${p.percentComplete}%`, height: '100%', background: 'linear-gradient(90deg,#7b5ea7,#e8547a)', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>⭐ +{p.xpEarned} XP earned</div>
                  </div>
                ))}
              </div>
            </div>
            <RecommendedCourses />
          </div>
        )}

        {/* COURSES TAB */}
        {tab === 'courses' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>📚 Course Catalog</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Discover skills from real students like you</p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>🔍</span>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search for anything..." style={{ paddingLeft: 44, width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {['All', 'Technology', 'Music', 'Language', 'Design', 'Business', 'Art', 'Science', 'Other'].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: '8px 18px', borderRadius: 99, border: `1px solid ${filterCat === cat ? 'rgba(123,94,167,0.6)' : 'rgba(255,255,255,0.1)'}`, background: filterCat === cat ? 'rgba(123,94,167,0.2)' : 'transparent', color: filterCat === cat ? '#9d7fd4' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {cat === 'All' ? '✦ All' : `${categoryEmoji(cat)} ${cat}`}
                </button>
              ))}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 20 }}>{filteredCourses.length} courses found</p>

            {filteredCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No courses found. Try a different search.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {filteredCourses.map((c, i) => (
                  <div key={i} onClick={() => navigate(`/courses/${c._id}`)}
                    style={{ background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(123,94,167,0.4)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(123,94,167,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ height: 130, background: 'linear-gradient(135deg, rgba(123,94,167,0.3), rgba(232,84,122,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative', overflow: 'hidden' }}>
                      {c.thumbnail ? <img src={`http://localhost:5001${c.thumbnail}`} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : categoryEmoji(c.category)}
                      <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', background: 'rgba(0,0,0,0.7)', borderRadius: 99, fontSize: 11, fontWeight: 700, color: c.price === 0 ? '#2de08e' : '#ffd700' }}>
                        {c.price === 0 ? 'FREE' : `₹${c.price}`}
                      </div>
                      {enrolledIds.includes(c._id) && (
                        <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: 'rgba(45,224,142,0.2)', border: '1px solid rgba(45,224,142,0.4)', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#2de08e' }}>✅ Enrolled</div>
                      )}
                    </div>
                    <div style={{ padding: '18px' }}>
                      <div style={{ fontSize: 10, color: '#9d7fd4', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{categoryEmoji(c.category)} {c.category}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 8, lineHeight: 1.35 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>by <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{c.tutor?.name}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                        <span>👥 {c.enrolledStudents?.length || 0} students</span>
                        <span>🎬 {c.lessons?.length || 0} lessons</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIVE SESSIONS TAB */}
        {tab === 'live' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>🔴 Live Sessions</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Join live classes from expert tutors in real-time</p>
            </div>

            {liveSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎙️</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No live sessions right now</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Check back soon — tutors go live every day!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {liveSessions.map((s, i) => (
                  <div key={i} style={{ background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(232,84,122,0.3)', borderRadius: 20, padding: '24px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => navigate(`/live/${s.roomId}`)}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(232,84,122,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8547a', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#e8547a' }}>LIVE NOW</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'white' }}>{s.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <Avatar name={s.tutor?.name} size={32} />
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{s.tutor?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>👥 {s.participants?.length || 0} watching</span>
                      <button style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#e8547a,#7b5ea7)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>Join Now →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === 'leaderboard' && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>🏆 Leaderboard</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Top learners on InnoVenture</p>
            </div>

            {leaderboard.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 48, padding: '40px 0' }}>
                {[1, 0, 2].map((idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    {idx === 0 && <div style={{ fontSize: 28, marginBottom: 6 }}>👑</div>}
                    <Avatar name={leaderboard[idx]?.name} size={idx === 0 ? 76 : 60} style={{ margin: '0 auto 10px', border: `3px solid ${idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32'}` }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: idx === 0 ? 16 : 14, color: 'white', marginBottom: 4 }}>{leaderboard[idx]?.name}</div>
                    <div style={{ color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{leaderboard[idx]?.xp} XP</div>
                    <div style={{ width: 88, height: idx === 0 ? 120 : idx === 1 ? 90 : 70, background: idx === 0 ? 'linear-gradient(135deg,#f0c040,#e0a820)' : idx === 1 ? 'linear-gradient(135deg,#c0c0c0,#a0a0a0)' : 'linear-gradient(135deg,#cd7f32,#a05020)', borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'rgba(0,0,0,0.6)' }}>
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, overflow: 'hidden' }}>
              {leaderboard.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,94,167,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, background: i === 0 ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#f0c040' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                  </div>
                  <Avatar name={u.name} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Level {u.level} · {u.badges?.length || 0} badges</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 18, fontFamily: 'var(--font-display)' }}>{u.xp} XP</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Level {u.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {tab === 'progress' && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>📈 My Progress</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Track your learning journey</p>
            </div>
            {progress.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24, fontSize: 16 }}>No courses enrolled yet!</p>
                <button onClick={() => setTab('courses')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }}>Browse Courses</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {progress.map((p, i) => (
                  <div key={i} style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '28px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => navigate(`/courses/${p.course?._id}`)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,94,167,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'white' }}>{p.course?.title}</h3>
                        <span style={{ padding: '3px 12px', background: 'rgba(123,94,167,0.15)', color: '#9d7fd4', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{p.course?.category}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: p.percentComplete === 100 ? '#2de08e' : '#9d7fd4', lineHeight: 1 }}>{p.percentComplete}%</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>complete</div>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{ width: `${p.percentComplete}%`, height: '100%', background: 'linear-gradient(90deg,#7b5ea7,#e8547a)', borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>⭐ <strong style={{ color: '#ffd700' }}>{p.xpEarned} XP</strong></div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>✅ <strong style={{ color: 'white' }}>{p.completedLessons?.length || 0}</strong> lessons done</div>
                    </div>
                    {p.percentComplete === 100 && (
                      <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(45,224,142,0.12)', border: '1px solid rgba(45,224,142,0.3)', borderRadius: 99, color: '#2de08e', fontSize: 13, fontWeight: 700 }}>
                        🎉 Course Completed!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}