import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Technology', 'Music', 'Language', 'Design', 'Business', 'Art', 'Science', 'Other'];
const catEmoji = (c) => ({ Technology: '💻', Music: '🎵', Language: '🌍', Design: '🎨', Business: '💼', Art: '🖌️', Science: '🔬', Other: '📖', All: '✨' })[c] || '📚';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [view, setView] = useState('grid');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/users/progress').then(r => {
      setEnrolledIds(Array.isArray(r.data) ? r.data.map(p => p.course?._id).filter(Boolean) : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = '/courses?';
    if (category !== 'All') url += `category=${category}&`;
    if (search) url += `search=${search}`;
    API.get(url).then(r => { setCourses(Array.isArray(r.data) ? r.data : []); setLoading(false); }).catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, [category, search]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'rgba(7,5,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 0', flexShrink: 0, backdropFilter: 'blur(20px)' }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: 'white' }}>Inno</span><span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
          </div>
        </div>
        {[{ icon: '⚡', label: 'Dashboard', path: '/dashboard' }, { icon: '📚', label: 'Courses', path: '/courses' }, { icon: '🔴', label: 'Live Sessions', path: '/live' }, { icon: '🏆', label: 'Leaderboard', path: '/dashboard' }].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', color: item.path === '/courses' ? 'var(--violet-bright)' : 'var(--text-muted)', background: item.path === '/courses' ? 'rgba(123,94,167,0.1)' : 'transparent', borderRight: item.path === '/courses' ? '2px solid var(--violet-bright)' : '2px solid transparent', transition: 'all 0.15s', fontWeight: 600, fontSize: 14 }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, padding: '0 12px' }}>
          <div style={{ padding: '12px 14px', background: 'rgba(123,94,167,0.06)', border: '1px solid rgba(123,94,167,0.1)', borderRadius: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 2 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Lv.{user?.level || 1} · <span style={{ color: 'var(--gold)' }}>{user?.xp || 0} XP</span></div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>Course Catalog 📚</h1>
          <p style={{ color: 'var(--text-muted)' }}>Discover skills from real students like you</p>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 18 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for anything..." style={{ paddingLeft: 48, fontSize: 15 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
            {['grid', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '8px 16px', background: view === v ? 'rgba(123,94,167,0.3)' : 'transparent', border: 'none', borderRadius: 8, color: view === v ? 'var(--violet-bright)' : 'var(--text-dim)', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s' }}>
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 18px', borderRadius: 99, border: `1.5px solid ${category === c ? 'var(--violet-bright)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', fontWeight: 700, fontSize: 13, background: category === c ? 'rgba(123,94,167,0.2)' : 'rgba(255,255,255,0.03)', color: category === c ? 'var(--violet-bright)' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
              {catEmoji(c)} {c}
            </button>
          ))}
        </div>

        {!loading && <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20, fontWeight: 600 }}>{courses.length} courses found</div>}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 20 }} />)}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>No courses found. Try a different search.</p>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {courses.map(course => {
              const enrolled = enrolledIds.includes(course._id);
              return (
                <div key={course._id} onClick={() => navigate(`/courses/${course._id}`)}
                  style={{ background: 'rgba(14,11,26,0.8)', border: `1.5px solid ${enrolled ? 'rgba(45,224,142,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 22, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(123,94,167,0.15)'; e.currentTarget.style.borderColor = enrolled ? 'rgba(45,224,142,0.5)' : 'rgba(123,94,167,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = enrolled ? 'rgba(45,224,142,0.3)' : 'rgba(255,255,255,0.06)'; }}>
                  {enrolled && (
                    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, padding: '4px 12px', background: 'rgba(45,224,142,0.9)', borderRadius: 99, fontSize: 11, fontWeight: 800, color: 'white' }}>✅ Enrolled</div>
                  )}
                  <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(123,94,167,0.3), rgba(232,84,122,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative', overflow: 'hidden' }}>
                    {course.thumbnail ? <img src={`http://https://innoventure-backend.onrender.com${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : catEmoji(course.category)}
                    <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 12px', background: 'rgba(0,0,0,0.7)', borderRadius: 99, fontSize: 12, fontWeight: 800, color: course.price === 0 ? 'var(--green)' : 'var(--gold)', backdropFilter: 'blur(8px)' }}>
                      {course.price === 0 ? 'FREE' : `$${course.price}`}
                    </div>
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: 10, color: 'var(--violet-bright)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{catEmoji(course.category)} {course.category}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 6, lineHeight: 1.3, color: 'white' }}>{course.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>{course.description?.substring(0, 70)}{course.description?.length > 70 ? '...' : ''}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{course.tutor?.name}</strong></div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>👥 {course.enrolledStudents?.length || 0}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map(course => {
              const enrolled = enrolledIds.includes(course._id);
              return (
                <div key={course._id} onClick={() => navigate(`/courses/${course._id}`)}
                  style={{ display: 'flex', gap: 20, background: 'rgba(14,11,26,0.8)', border: `1.5px solid ${enrolled ? 'rgba(45,224,142,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', padding: '0' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,94,167,0.4)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = enrolled ? 'rgba(45,224,142,0.2)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <div style={{ width: 100, background: 'linear-gradient(135deg, rgba(123,94,167,0.3), rgba(232,84,122,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    {course.thumbnail ? <img src={`http://https://innoventure-backend.onrender.com${course.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : catEmoji(course.category)}
                  </div>
                  <div style={{ flex: 1, padding: '18px 20px 18px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--violet-bright)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{catEmoji(course.category)} {course.category}</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'white', marginBottom: 4 }}>{course.title}</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{course.tutor?.name}</strong> · 👥 {course.enrolledStudents?.length || 0} students</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ padding: '4px 14px', background: course.price === 0 ? 'rgba(45,224,142,0.1)' : 'rgba(240,192,64,0.1)', color: course.price === 0 ? 'var(--green)' : 'var(--gold)', border: `1px solid ${course.price === 0 ? 'rgba(45,224,142,0.25)' : 'rgba(240,192,64,0.25)'}`, borderRadius: 99, fontSize: 13, fontWeight: 700 }}>
                          {course.price === 0 ? 'FREE' : `$${course.price}`}
                        </span>
                        {enrolled && <span style={{ padding: '3px 10px', background: 'rgba(45,224,142,0.1)', color: 'var(--green)', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>✅ Enrolled</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
