import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const Stars = ({ rating, size = 16 }) => (
  <span style={{ fontSize: size, letterSpacing: 2 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#f0c040' : 'rgba(255,255,255,0.15)' }}>★</span>
    ))}
  </span>
);

export default function TutorProfile() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/users/tutor/${tutorId}`)
      .then(r => { setTutor(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tutorId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48, animation: 'spin-slow 2s linear infinite' }}>⚡</div>
    </div>
  );

  if (!tutor) return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <p style={{ color: 'var(--text-muted)' }}>Tutor not found</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>← Back</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', paddingBottom: 80 }}>
      {/* Nav */}
      <div style={{ padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>← Back</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'white' }}>Tutor Profile</span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,84,122,0.12), rgba(123,94,167,0.12))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 40, marginBottom: 28, display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 96, height: 96, borderRadius: 24, background: 'linear-gradient(135deg, #e8547a, #f0c040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0, boxShadow: '0 8px 32px rgba(232,84,122,0.3)' }}>
            {tutor.avatar ? <img src={tutor.avatar} alt={tutor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24 }} /> : tutor.name?.[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'white', margin: 0 }}>{tutor.name}</h1>
              <span style={{ padding: '4px 12px', background: 'rgba(45,224,142,0.12)', color: 'var(--green)', border: '1px solid rgba(45,224,142,0.25)', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>✅ Verified Tutor</span>
            </div>

            {tutor.expertise && <p style={{ color: 'var(--violet-bright)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>🎯 {tutor.expertise}</p>}
            {tutor.location && <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>📍 {tutor.location}</p>}
            {tutor.bio && <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 16, maxWidth: 560 }}>{tutor.bio}</p>}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tutor.linkedIn && (
                <a href={tutor.linkedIn.startsWith('http') ? tutor.linkedIn : `https://${tutor.linkedIn}`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.35)', borderRadius: 10, color: '#4a9fd5', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,102,194,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,102,194,0.15)'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#4a9fd5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn Profile
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 140 }}>
            {[
              { icon: '📚', value: tutor.totalCourses, label: 'Courses' },
              { icon: '👥', value: tutor.totalStudents, label: 'Students' },
              { icon: '⭐', value: tutor.xp, label: 'XP Points' },
              { icon: '🏅', value: `Lv.${tutor.level}`, label: 'Level' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses */}
        {tutor.courses?.length > 0 && (
          <div style={{ background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20 }}>📚 Courses by {tutor.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {tutor.courses.map(course => (
                <div key={course._id} onClick={() => navigate(`/courses/${course._id}`)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,84,122,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ height: 100, background: 'linear-gradient(135deg, rgba(232,84,122,0.25), rgba(123,94,167,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, position: 'relative', overflow: 'hidden' }}>
                    {course.thumbnail ? <img src={`https://innoventure-backend.onrender.com${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : '📚'}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 6 }}>{course.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>👥 {course.enrolledStudents?.length || 0}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: course.price === 0 ? 'var(--green)' : 'var(--gold)' }}>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
