import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    API.get(`/courses/${id}`).then(r => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
    API.get('/users/progress').then(r => {
      const p = Array.isArray(r.data) ? r.data.find(x => x.course?._id === id) : null;
      setProgress(p);
    }).catch(() => {});
  }, [id]);

  const isEnrolled = course?.enrolledStudents?.includes(user?._id) || !!progress;

  const enroll = async () => {
    setEnrolling(true);
    try {
      await API.post(`/courses/${id}/enroll`);
      toast.success('Enrolled! +50 XP earned 🎉');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setEnrolling(false);
  };

  const markLesson = async (lessonId) => {
    try {
      await API.post(`/progress/${id}/complete/${lessonId}`);
      toast.success('+10 XP earned! ⭐');
    } catch {}
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, animation: 'spin-slow 2s linear infinite', display: 'inline-block', marginBottom: 16 }}>⚡</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading course...</p>
      </div>
    </div>
  );

  if (!course) return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Course not found</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Browse Courses</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)' }}>
      {/* Nav */}
      <div style={{ padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>← Back</button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'white', flex: 1 }}>{course.title}</div>
        {isEnrolled && <span style={{ padding: '4px 14px', background: 'rgba(45,224,142,0.1)', color: 'var(--green)', border: '1px solid rgba(45,224,142,0.25)', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>✅ Enrolled</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, maxWidth: 1400, margin: '0 auto' }}>
        {/* Main */}
        <div style={{ padding: '40px' }}>
          {/* Video Player */}
          {activeLesson?.content && activeLesson.type === 'video' ? (
            <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 32, background: '#000', position: 'relative' }}>
              <video ref={videoRef} controls style={{ width: '100%', maxHeight: 480, display: 'block' }} src={`http://https://innoventure-backend.onrender.com${activeLesson.content}`}
                onEnded={() => { markLesson(activeLesson._id); toast.success('Lesson complete! ⭐'); }} />
              <div style={{ padding: '16px 24px', background: 'rgba(14,11,26,0.9)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'white' }}>{activeLesson.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{activeLesson.duration > 0 ? `${activeLesson.duration} min` : ''}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: 320, borderRadius: 20, overflow: 'hidden', marginBottom: 32, background: 'linear-gradient(135deg, rgba(123,94,167,0.3), rgba(232,84,122,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, position: 'relative' }}>
              {course.thumbnail ? <img src={`http://https://innoventure-backend.onrender.com${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : '📚'}
              {!isEnrolled && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Enroll to unlock all lessons</p>
                    <button onClick={enroll} disabled={enrolling} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-body)' }}>
                      {enrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll Free 🎓' : `Enroll for $${course.price}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Course info */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <span style={{ padding: '4px 14px', background: 'rgba(123,94,167,0.15)', color: 'var(--violet-bright)', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{course.category}</span>
            <span style={{ padding: '4px 14px', background: 'rgba(45,224,142,0.08)', color: 'var(--green)', border: '1px solid rgba(45,224,142,0.2)', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>👥 {course.enrolledStudents?.length || 0} students</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>🎬 {course.lessons?.length || 0} lessons</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 12, color: 'white' }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{course.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(123,94,167,0.06)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)' }}>
              {course.tutor?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{course.tutor?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Course Instructor</div>
            </div>
          </div>

          {!isEnrolled && (
            <button onClick={enroll} disabled={enrolling} style={{ marginTop: 24, width: '100%', padding: '16px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 16, color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-body)', boxShadow: '0 4px 24px rgba(123,94,167,0.4)' }}>
              {enrolling ? 'Enrolling...' : course.price === 0 ? '🎓 Enroll for Free' : `💳 Enroll for $${course.price}`}
            </button>
          )}
        </div>

        {/* Lesson sidebar */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 65px)', position: 'sticky', top: 65 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'white' }}>🎬 Lessons ({course.lessons?.length || 0})</h3>
          {course.lessons?.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>No lessons yet.</p>}
          {course.lessons?.map((lesson, i) => {
            const isActive = activeLesson?._id === lesson._id;
            const isDone = progress?.completedLessons?.includes(lesson._id);
            return (
              <div key={lesson._id || i} onClick={() => isEnrolled && setActiveLesson(lesson)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8, cursor: isEnrolled ? 'pointer' : 'default', background: isActive ? 'rgba(123,94,167,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? 'rgba(123,94,167,0.4)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.15s', opacity: isEnrolled ? 1 : 0.5 }}
                onMouseEnter={e => { if (isEnrolled && !isActive) e.currentTarget.style.background = 'rgba(123,94,167,0.08)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDone ? 'rgba(45,224,142,0.2)' : isActive ? 'rgba(123,94,167,0.3)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, border: `1px solid ${isDone ? 'rgba(45,224,142,0.4)' : 'transparent'}` }}>
                  {isDone ? '✅' : lesson.type === 'video' ? '▶' : lesson.type === 'live' ? '🔴' : '📝'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'var(--violet-bright)' : 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{lesson.type}{lesson.duration > 0 ? ` · ${lesson.duration}m` : ''}</div>
                </div>
                {!isEnrolled && <span style={{ fontSize: 14 }}>🔒</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
