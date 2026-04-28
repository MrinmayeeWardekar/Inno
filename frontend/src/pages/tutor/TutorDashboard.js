import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function TutorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [tab, setTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);

  const fetchData = () => {
    API.get('/courses/tutor/mycourses').then(r => setCourses(Array.isArray(r.data) ? r.data : [])).catch(() => setCourses([]));
    API.get('/users/earnings').then(r => {
      setEarnings(r.data);
      if (r.data?.studentDetails) setStudents(r.data.studentDetails);
    }).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const nav = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'courses', icon: '📚', label: 'My Courses' },
    { id: 'earnings', icon: '💰', label: 'Earnings' },
    { id: 'create', icon: '➕', label: 'Create Course' },
    { id: 'live', icon: '🔴', label: 'Go Live' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ];

  const StatCard = ({ icon, label, value, color, bg, onClick }) => (
    <div onClick={onClick} style={{ padding: 24, background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${color}40`; if (onClick) e.currentTarget.style.boxShadow = `0 8px 30px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)', color }}>{value}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      </div>
      {onClick && <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }}>→</span>}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07060f', color: 'white' }}>

      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? 72 : 260, background: 'rgba(7,5,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '24px 0', transition: 'width 0.3s ease', position: 'fixed', top: 0, left: 0, bottom: 0, backdropFilter: 'blur(20px)', zIndex: 50 }}>
        <div style={{ padding: '0 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <div style={{ margin: '0 12px 20px', padding: '8px 14px', background: user?.tutorStatus === 'approved' ? 'rgba(45,224,142,0.08)' : 'rgba(246,173,85,0.08)', border: `1px solid ${user?.tutorStatus === 'approved' ? 'rgba(45,224,142,0.2)' : 'rgba(246,173,85,0.2)'}`, borderRadius: 10, fontSize: 12, fontWeight: 700, color: user?.tutorStatus === 'approved' ? '#2de08e' : '#f6ad55', textAlign: 'center' }}>
            {user?.tutorStatus === 'approved' ? '✅ Approved Tutor' : '⏳ Pending Approval'}
          </div>
        )}

        <nav style={{ flex: 1, padding: '0 12px' }}>
          {nav.map(item => (
            <div key={item.id}
              onClick={() => {
                if (item.id === 'create') navigate('/tutor/create');
                else if (item.id === 'live') navigate('/tutor/live');
                else if (item.id === 'profile') navigate(`/tutor/profile/${user._id}`);
                else setTab(item.id);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 4, cursor: 'pointer', transition: 'all 0.15s', background: tab === item.id && !['create','live','profile'].includes(item.id) ? 'rgba(123,94,167,0.2)' : 'transparent', color: tab === item.id && !['create','live','profile'].includes(item.id) ? '#9d7fd4' : 'rgba(255,255,255,0.4)', border: `1px solid ${tab === item.id && !['create','live','profile'].includes(item.id) ? 'rgba(123,94,167,0.3)' : 'transparent'}` }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if (tab !== item.id) { e.currentTarget.style.background = tab === item.id ? 'rgba(123,94,167,0.2)' : 'transparent'; e.currentTarget.style.color = tab === item.id ? '#9d7fd4' : 'rgba(255,255,255,0.4)'; } }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {!sidebarCollapsed ? (
            <div style={{ padding: '14px 16px', background: 'rgba(123,94,167,0.08)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 14, marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 2 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Tutor Account</div>
            </div>
          ) : null}
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>🚪</span>{!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Students Modal */}
      {showStudents && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowStudents(false)}>
          <div style={{ background: '#0e0b1a', border: '1px solid rgba(123,94,167,0.3)', borderRadius: 24, padding: 32, maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>👥 Enrolled Students ({students.length})</h3>
              <button onClick={() => setShowStudents(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20, padding: '4px 10px', borderRadius: 8 }}>✕</button>
            </div>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <p>No students enrolled yet!</p>
              </div>
            ) : students.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white', flexShrink: 0 }}>{s.name?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#ffd700', fontWeight: 700 }}>{s.xp || 0} XP</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Lv.{s.level || 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 48px', marginLeft: sidebarCollapsed ? 72 : 260, transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>

        {user?.tutorStatus !== 'approved' && (
          <div style={{ padding: 16, background: 'rgba(246,173,85,0.08)', border: '1px solid rgba(246,173,85,0.2)', borderRadius: 14, marginBottom: 28, color: '#f6ad55', fontSize: 14, fontWeight: 600 }}>
            ⏳ Your account is pending admin approval. You can explore the dashboard but won't be able to publish courses until approved.
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Here's your teaching overview</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="📚" label="Total Courses" value={courses.length} color="#9d7fd4" bg="rgba(123,94,167,0.15)" onClick={() => setTab('courses')} />
              <StatCard icon="👥" label="Total Students" value={earnings?.totalStudents || 0} color="#00d4ff" bg="rgba(0,212,255,0.12)" onClick={() => setShowStudents(true)} />
              <StatCard icon="💰" label="Your Earnings" value={`₹${(earnings?.tutorEarnings || 0).toFixed(0)}`} color="#ffd700" bg="rgba(255,215,0,0.1)" onClick={() => setTab('earnings')} />
              <StatCard icon="✅" label="Approved" value={courses.filter(c => c.status === 'approved').length} color="#2de08e" bg="rgba(45,224,142,0.12)" onClick={() => setTab('courses')} />
            </div>

            <div style={{ padding: 28, background: 'rgba(123,94,167,0.06)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🤖 Tips to Grow Faster</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '💡 Add short quizzes after each lesson — courses with quizzes see 3x more completions.',
                  '🎙️ Speak clearly and energetically — it increases student retention by 40%.',
                  '🔴 Go live once a week — live sessions boost course enrollment by 2x.',
                  earnings?.totalStudents > 0 ? `🏆 You have ${earnings.totalStudents} students! Consider creating an advanced follow-up course.` : '🚀 Create your first course to start earning!',
                ].map((tip, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{tip}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MY COURSES */}
        {tab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>My Courses</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Manage your content</p>
              </div>
              <button onClick={() => navigate('/tutor/create')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>+ Create Course</button>
            </div>

            {courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>No courses yet!</p>
                <button onClick={() => navigate('/tutor/create')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }}>Create Your First Course</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {courses.map(c => (
                  <div key={c._id} style={{ padding: '20px 24px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(123,94,167,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 6 }}>{c.title}</div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 10px', background: 'rgba(123,94,167,0.15)', color: '#9d7fd4', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{c.category}</span>
                        <span style={{ padding: '2px 10px', background: c.status === 'approved' ? 'rgba(45,224,142,0.12)' : c.status === 'pending' ? 'rgba(246,173,85,0.12)' : 'rgba(252,129,129,0.12)', color: c.status === 'approved' ? '#2de08e' : c.status === 'pending' ? '#f6ad55' : '#fc8181', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{c.status}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>👥 {c.enrolledStudents?.length || 0} students</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{c.price === 0 ? 'Free' : `₹${c.price}`}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`/tutor/quiz/${c._id}`)} style={{ padding: '8px 16px', background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(123,94,167,0.3)', borderRadius: 10, color: '#9d7fd4', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>+ Quiz</button>
                      <button onClick={() => navigate(`/tutor/edit/${c._id}`)} style={{ padding: '8px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, color: '#00d4ff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>✏️ Edit</button>
                      <button onClick={() => deleteCourse(c._id)} style={{ padding: '8px 16px', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 10, color: '#fc8181', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS */}
        {tab === 'earnings' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>💰 Earnings</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Your revenue breakdown</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatCard icon="💵" label="Total Revenue" value={`₹${(earnings?.totalRevenue || 0).toFixed(0)}`} color="#9d7fd4" bg="rgba(123,94,167,0.12)" />
              <StatCard icon="💰" label="Your Earnings (80%)" value={`₹${(earnings?.tutorEarnings || 0).toFixed(0)}`} color="#ffd700" bg="rgba(255,215,0,0.1)" />
              <StatCard icon="🏢" label="Platform Cut (20%)" value={`₹${(earnings?.platformCut || 0).toFixed(0)}`} color="rgba(255,255,255,0.4)" bg="rgba(255,255,255,0.04)" />
            </div>

            <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Per Course Breakdown</h3>
              </div>
              {!earnings?.courses?.length ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No approved courses yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Course', 'Price', 'Students', 'Revenue', 'Your Cut'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.courses.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: 14, color: 'white' }}>{c.title}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{c.price === 0 ? 'Free' : `₹${c.price}`}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{c.students}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>₹{c.revenue.toFixed(0)}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: '#ffd700', fontWeight: 800 }}>₹{c.tutorEarnings.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ marginTop: 16, padding: 16, background: 'rgba(45,224,142,0.05)', border: '1px solid rgba(45,224,142,0.15)', borderRadius: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              💡 InnoVenture takes a <strong style={{ color: '#2de08e' }}>20% platform fee</strong> on all paid courses. Earnings are calculated based on current enrollments.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}