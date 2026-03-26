import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [pendingTutors, setPendingTutors] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchAll = () => {
    API.get('/admin/stats').then(r => setStats(r.data || {})).catch(() => {});
    API.get('/admin/tutors/pending').then(r => setPendingTutors(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/admin/courses/pending').then(r => setPendingCourses(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/admin/users').then(r => setAllUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/admin/allcourses').then(r => setAllCourses(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const approveTutor = async (id, status) => {
    try { await API.put(`/admin/tutors/${id}`, { status }); toast.success(`Tutor ${status}!`); fetchAll(); }
    catch { toast.error('Action failed'); }
  };

  const approveCourse = async (id, status) => {
    try { await API.put(`/admin/courses/${id}`, { status }); toast.success(`Course ${status}!`); fetchAll(); }
    catch { toast.error('Action failed'); }
  };

  const totalRevenue = allCourses.filter(c => c.status === 'approved').reduce((sum, c) => sum + ((c.enrolledStudents?.length || 0) * (c.price || 0)), 0);
  const platformEarnings = totalRevenue * 0.20;

  const nav = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'financials', icon: '💰', label: 'Financials' },
    { id: 'tutors', icon: '👨‍🏫', label: 'Tutor Approvals', badge: pendingTutors.length },
    { id: 'courses', icon: '📚', label: 'Course Approvals', badge: pendingCourses.length },
    { id: 'users', icon: '👥', label: 'All Users' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ];

  const StatCard = ({ icon, label, value, color, bg }) => (
    <div style={{ padding: 24, background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)', color }}>{value}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07060f', color: 'white' }}>

      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? 72 : 260, background: 'rgba(7,5,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '24px 0', transition: 'width 0.3s ease', position: 'fixed', top: 0, left: 0, bottom: 0, backdropFilter: 'blur(20px)', zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <span style={{ color: 'white' }}>Inno</span>
              <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 8, borderRadius: 8, fontSize: 12, marginLeft: 'auto' }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div style={{ margin: '0 12px 20px', padding: '6px 14px', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#fc8181', textAlign: 'center' }}>
            🛡️ Admin Panel
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {nav.map(item => (
            <div key={item.id}
              onClick={() => item.id === 'profile' ? navigate('/profile') : setTab(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 4, cursor: 'pointer', transition: 'all 0.15s', background: tab === item.id && item.id !== 'profile' ? 'rgba(123,94,167,0.2)' : 'transparent', color: tab === item.id && item.id !== 'profile' ? '#9d7fd4' : 'rgba(255,255,255,0.4)', border: `1px solid ${tab === item.id && item.id !== 'profile' ? 'rgba(123,94,167,0.3)' : 'transparent'}` }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if (tab !== item.id) { e.currentTarget.style.background = tab === item.id ? 'rgba(123,94,167,0.2)' : 'transparent'; e.currentTarget.style.color = tab === item.id ? '#9d7fd4' : 'rgba(255,255,255,0.4)'; } }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge > 0 && (
                <span style={{ background: '#e8547a', color: 'white', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 7px', flexShrink: 0 }}>{item.badge}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>🚪</span>{!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 48px', marginLeft: sidebarCollapsed ? 72 : 260, transition: 'margin-left 0.3s ease' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Admin Dashboard 🛡️</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Platform overview and management</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="👥" label="Total Users" value={stats.totalUsers || 0} color="#9d7fd4" bg="rgba(123,94,167,0.12)" />
              <StatCard icon="📚" label="Live Courses" value={stats.totalCourses || 0} color="#00d4ff" bg="rgba(0,212,255,0.12)" />
              <StatCard icon="👨‍🏫" label="Active Tutors" value={stats.totalTutors || 0} color="#ffd700" bg="rgba(255,215,0,0.1)" />
              <StatCard icon="💰" label="Platform Revenue" value={`₹${platformEarnings.toFixed(0)}`} color="#2de08e" bg="rgba(45,224,142,0.12)" />
              <StatCard icon="🎓" label="Learners" value={stats.totalLearners || 0} color="#e8547a" bg="rgba(232,84,122,0.12)" />
              <StatCard icon="⏳" label="Pending Reviews" value={(pendingTutors.length) + (pendingCourses.length)} color="#f6ad55" bg="rgba(246,173,85,0.12)" />
            </div>
            {(pendingTutors.length > 0 || pendingCourses.length > 0) && (
              <div style={{ padding: 20, background: 'rgba(246,173,85,0.06)', border: '1px solid rgba(246,173,85,0.2)', borderRadius: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#f6ad55' }}>📋 Actions Needed</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  {pendingTutors.length > 0 && `⚠️ ${pendingTutors.length} tutor(s) waiting for approval. `}
                  {pendingCourses.length > 0 && `⚠️ ${pendingCourses.length} course(s) waiting for review.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FINANCIALS */}
        {tab === 'financials' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>💰 Platform Financials</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Revenue breakdown and tutor payouts</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatCard icon="💵" label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} color="#9d7fd4" bg="rgba(123,94,167,0.12)" />
              <StatCard icon="🏢" label="Platform (20%)" value={`₹${platformEarnings.toFixed(0)}`} color="#ffd700" bg="rgba(255,215,0,0.1)" />
              <StatCard icon="👨‍🏫" label="Tutor Payouts (80%)" value={`₹${(totalRevenue * 0.8).toFixed(0)}`} color="#2de08e" bg="rgba(45,224,142,0.12)" />
            </div>
            <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Course Revenue Breakdown</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Course', 'Tutor', 'Price', 'Students', 'Revenue', 'Platform', 'Tutor Cut'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allCourses.filter(c => c.status === 'approved').map((c, i) => {
                    const rev = (c.enrolledStudents?.length || 0) * (c.price || 0);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,94,167,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: 'white' }}>{c.title}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{c.tutor?.name}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{c.price === 0 ? 'Free' : `₹${c.price}`}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{c.enrolledStudents?.length || 0}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>₹{rev.toFixed(0)}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#ffd700', fontWeight: 700 }}>₹{(rev * 0.2).toFixed(0)}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#2de08e', fontWeight: 700 }}>₹{(rev * 0.8).toFixed(0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TUTOR APPROVALS */}
        {tab === 'tutors' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>👨‍🏫 Tutor Approvals</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Review and approve tutor applications</p>
            </div>
            {pendingTutors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No pending applications!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingTutors.map(t => (
                  <div key={t._id} style={{ padding: '20px 24px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'white', flexShrink: 0 }}>{t.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: 'white' }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{t.email} · Applied {new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approveTutor(t._id, 'approved')} style={{ padding: '8px 20px', background: 'rgba(45,224,142,0.12)', border: '1px solid rgba(45,224,142,0.3)', borderRadius: 10, color: '#2de08e', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>✅ Approve</button>
                      <button onClick={() => approveTutor(t._id, 'rejected')} style={{ padding: '8px 20px', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 10, color: '#fc8181', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COURSE APPROVALS */}
        {tab === 'courses' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>📚 Course Approvals</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Review courses before they go live</p>
            </div>
            {pendingCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No courses pending review!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingCourses.map(c => (
                  <div key={c._id} style={{ padding: '20px 24px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 6 }}>{c.title}</div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>by {c.tutor?.name}</span>
                        <span style={{ padding: '2px 10px', background: 'rgba(123,94,167,0.15)', color: '#9d7fd4', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{c.category}</span>
                        <span style={{ fontSize: 13, color: c.price === 0 ? '#2de08e' : '#ffd700', fontWeight: 700 }}>{c.price === 0 ? 'Free' : `₹${c.price}`}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approveCourse(c._id, 'approved')} style={{ padding: '8px 20px', background: 'rgba(45,224,142,0.12)', border: '1px solid rgba(45,224,142,0.3)', borderRadius: 10, color: '#2de08e', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>✅ Approve</button>
                      <button onClick={() => approveCourse(c._id, 'rejected')} style={{ padding: '8px 20px', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 10, color: '#fc8181', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL USERS */}
        {tab === 'users' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>👥 All Users</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Everyone on InnoVenture ({allUsers.length} total)</p>
            </div>
            <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['User', 'Email', 'Role', 'XP', 'Level', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u, i) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,94,167,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: 'white', flexShrink: 0 }}>{u.name?.[0]}</div>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '3px 10px', background: u.role === 'admin' ? 'rgba(252,129,129,0.12)' : u.role === 'tutor' ? 'rgba(123,94,167,0.12)' : 'rgba(45,224,142,0.12)', color: u.role === 'admin' ? '#fc8181' : u.role === 'tutor' ? '#9d7fd4' : '#2de08e', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#ffd700', fontWeight: 700 }}>{u.xp || 0}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{u.level || 1}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}