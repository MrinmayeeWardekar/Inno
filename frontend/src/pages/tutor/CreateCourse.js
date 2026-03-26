import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CATS = ['Technology', 'Music', 'Language', 'Design', 'Business', 'Art', 'Science', 'Other'];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Technology', price: 0, tags: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', duration: '' });
  const [lessonVideo, setLessonVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const createCourse = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      const { data } = await API.post('/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCourseId(data._id); toast.success('Course created! Add your lessons 🎉'); setStep(2);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const addLesson = async (e) => {
    e.preventDefault(); if (!courseId) return; setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', lessonForm.title); fd.append('type', lessonForm.type); fd.append('duration', lessonForm.duration || 0);
      if (lessonVideo) fd.append('video', lessonVideo);
      const { data } = await API.post(`/courses/${courseId}/lessons`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLessons(data.lessons || []); setLessonForm({ title: '', type: 'video', duration: '' }); setLessonVideo(null);
      toast.success('Lesson added! ✅');
    } catch { toast.error('Failed to add lesson'); }
    setLoading(false);
  };

  const inp = { width: '100%', padding: '13px 16px', background: 'rgba(20,16,34,0.8)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 12, color: 'white', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' };
  const focus = (e) => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)'; };
  const blur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', padding: '40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => navigate('/tutor')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 32 }}>← Back</button>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
          {['Course Info', 'Add Lessons', 'Done! 🚀'].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px', background: step === i + 1 ? 'linear-gradient(135deg,rgba(123,94,167,0.3),rgba(232,84,122,0.2))' : step > i + 1 ? 'rgba(45,224,142,0.1)' : 'transparent', color: step === i + 1 ? 'white' : step > i + 1 ? 'var(--green)' : 'var(--text-dim)', fontWeight: 700, fontSize: 13, borderRadius: 10, border: step === i + 1 ? '1px solid rgba(123,94,167,0.3)' : '1px solid transparent', transition: 'all 0.3s' }}>
              {step > i + 1 ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 40, animation: 'scale-in 0.4s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 28 }}>📝 Course Details</h2>
            <form onSubmit={createCourse} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Course Title *</label>
                <input style={inp} placeholder="e.g. Learn Guitar from Scratch" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Description *</label>
                <textarea style={{ ...inp, height: 120, resize: 'vertical' }} placeholder="What will students learn?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Category</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Price ($)</label>
                  <input style={inp} type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} onFocus={focus} onBlur={blur} placeholder="0 = Free" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Tags</label>
                <input style={inp} placeholder="guitar, beginner, music" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Thumbnail Image</label>
                <input style={{ ...inp, cursor: 'pointer' }} type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])} />
                {thumbnail && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--green)' }}>✅ {thumbnail.name}</div>}
              </div>
              <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 24px rgba(123,94,167,0.3)', marginTop: 8 }}>
                {loading ? 'Creating...' : 'Continue to Add Lessons →'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'scale-in 0.4s ease' }}>
            <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 40, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 28 }}>🎬 Add Lessons</h2>
              <form onSubmit={addLesson} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Lesson Title *</label>
                  <input style={inp} placeholder="e.g. Introduction to Chords" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required onFocus={focus} onBlur={blur} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Type</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={lessonForm.type} onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}>
                      <option value="video">🎥 Video</option>
                      <option value="notes">📝 Notes</option>
                      <option value="live">🔴 Live</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Duration (min)</label>
                    <input style={inp} type="number" min="0" placeholder="10" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                {lessonForm.type === 'video' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Upload Video (MP4, max 500MB)</label>
                    <input style={{ ...inp, cursor: 'pointer' }} type="file" accept="video/*" onChange={e => setLessonVideo(e.target.files[0])} />
                    {lessonVideo && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--green)' }}>✅ {lessonVideo.name} ({(lessonVideo.size / 1024 / 1024).toFixed(1)} MB)</div>}
                  </div>
                )}
                <button type="submit" disabled={loading} style={{ padding: '13px', background: loading ? 'rgba(123,94,167,0.4)' : 'linear-gradient(135deg,#7b5ea7,#9b8cff)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)' }}>
                  {loading ? '⏳ Uploading...' : '+ Add Lesson'}
                </button>
              </form>
            </div>

            {lessons.length > 0 && (
              <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'white', fontSize: 16 }}>✅ Lessons Added ({lessons.length})</h3>
                {lessons.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < lessons.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: 18 }}>{l.type === 'video' ? '🎥' : l.type === 'live' ? '🔴' : '📝'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{l.type}{l.duration > 0 ? ` · ${l.duration}m` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { toast.success('Course submitted for review! 🚀'); navigate('/tutor'); }} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 16, color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 24px rgba(123,94,167,0.4)' }}>
              🚀 Submit Course for Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
