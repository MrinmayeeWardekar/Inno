import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CATS = ['Technology', 'Music', 'Language', 'Design', 'Business', 'Art', 'Science', 'Other'];

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [thumbPreview, setThumbPreview] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [detailForm, setDetailForm] = useState({ title: '', description: '', category: '', price: '', tags: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', duration: '', youtubeUrl: '' });

  useEffect(() => {
    API.get(`/courses/${id}`).then(r => {
      setCourse(r.data);
      setDetailForm({
        title: r.data.title || '',
        description: r.data.description || '',
        category: r.data.category || '',
        price: r.data.price || 0,
        tags: r.data.tags?.join(', ') || ''
      });
    }).catch(() => toast.error('Course not found'));
  }, [id]);

  const inp = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(20,16,34,0.8)',
    border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 12, color: 'white', fontSize: 14,
    fontFamily: 'var(--font-body)', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s'
  };
  const focus = (e) => { e.target.style.borderColor = '#9d7fd4'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)'; };
  const blur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
    if (url.includes('youtube.com/embed/')) return url;
    return url;
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', detailForm.title);
      fd.append('description', detailForm.description);
      fd.append('category', detailForm.category);
      fd.append('price', detailForm.price);
      fd.append('tags', detailForm.tags);
      if (thumbFile) fd.append('thumbnail', thumbFile);
      const { data } = await API.put(`/courses/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCourse(data);
      setThumbFile(null);
      toast.success('Course updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setLoading(false);
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title) return toast.error('Lesson title is required');
    if (lessonForm.type === 'video' && !lessonForm.youtubeUrl) return toast.error('Please enter a YouTube URL');
    setLoading(true);
    try {
      const embedUrl = lessonForm.type === 'video' ? getYouTubeEmbedUrl(lessonForm.youtubeUrl) : '';
      const fd = new FormData();
      fd.append('title', lessonForm.title);
      fd.append('type', lessonForm.type);
      fd.append('duration', lessonForm.duration || 0);
      fd.append('content', embedUrl);
      const { data } = await API.post(`/courses/${id}/lessons`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCourse(data);
      setLessonForm({ title: '', type: 'video', duration: '', youtubeUrl: '' });
      toast.success('Lesson added! ✅');
      setActiveTab('lessons');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lesson');
    }
    setLoading(false);
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const { data } = await API.delete(`/courses/${id}/lessons/${lessonId}`);
      setCourse(data);
      toast.success('Lesson deleted');
    } catch { toast.error('Failed to delete lesson'); }
  };

  if (!course) return (
    <div style={{ minHeight: '100vh', background: '#07060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48, animation: 'spin 2s linear infinite' }}>⚡</div>
    </div>
  );

  const tabs = [
    { key: 'details', label: '✏️ Edit Details' },
    { key: 'lessons', label: `🎬 Lessons (${course.lessons?.length || 0})` },
    { key: 'addLesson', label: '+ Add Lesson' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#07060f', color: 'white', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <button onClick={() => navigate('/tutor')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', marginBottom: 32 }}>
          ← Back to Dashboard
        </button>

        {/* Course header */}
        <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
          {course.thumbnail && (
            <img src={course.thumbnail} alt={course.title} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
          )}
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{course.title}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 12px', background: 'rgba(123,94,167,0.15)', color: '#9d7fd4', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{course.category}</span>
              <span style={{ padding: '3px 12px', background: course.status === 'approved' ? 'rgba(45,224,142,0.12)' : 'rgba(246,173,85,0.12)', color: course.status === 'approved' ? '#2de08e' : '#f6ad55', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{course.status}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>₹{course.price}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>👥 {course.enrolledStudents?.length || 0} students</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding: '10px 20px', background: activeTab === tab.key ? 'linear-gradient(135deg,#7b5ea7,#e8547a)' : 'rgba(255,255,255,0.05)', border: '1px solid ' + (activeTab === tab.key ? 'transparent' : 'rgba(255,255,255,0.08)'), borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* EDIT DETAILS TAB */}
        {activeTab === 'details' && (
          <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 28 }}>✏️ Edit Course Details</h2>
            <form onSubmit={saveDetails} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Course Title</label>
                <input style={inp} value={detailForm.title} onChange={e => setDetailForm({ ...detailForm, title: e.target.value })} onFocus={focus} onBlur={blur} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Description</label>
                <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={detailForm.description} onChange={e => setDetailForm({ ...detailForm, description: e.target.value })} onFocus={focus} onBlur={blur} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Category</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={detailForm.category} onChange={e => setDetailForm({ ...detailForm, category: e.target.value })}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Price (₹)</label>
                  <input style={inp} type="number" min="0" value={detailForm.price} onChange={e => setDetailForm({ ...detailForm, price: e.target.value })} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Tags (comma separated)</label>
                <input style={inp} placeholder="guitar, beginner, music" value={detailForm.tags} onChange={e => setDetailForm({ ...detailForm, tags: e.target.value })} onFocus={focus} onBlur={blur} />
              </div>

              {/* Thumbnail upload */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Course Thumbnail</label>
                {(thumbPreview || course.thumbnail) && (
                  <img src={thumbPreview || course.thumbnail} alt="thumbnail" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                )}
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', background: 'rgba(20,16,34,0.8)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 28 }}>🖼️</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{thumbFile ? thumbFile.name : 'Click to change thumbnail'}</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleThumbChange} style={{ display: 'none' }} />
                </label>
              </div>

              <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'rgba(123,94,167,0.4)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* LESSONS LIST TAB */}
        {activeTab === 'lessons' && (
          <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Current Lessons</h2>
            {!course.lessons?.length ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p>No lessons yet.</p>
                <button onClick={() => setActiveTab('addLesson')} style={{ marginTop: 16, padding: '10px 24px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                  + Add First Lesson
                </button>
              </div>
            ) : (
              course.lessons.map((lesson, i) => (
                <div key={lesson._id || i} style={{ padding: '16px 0', borderBottom: i < course.lessons.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(123,94,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {lesson.type === 'video' ? '🎥' : lesson.type === 'live' ? '🔴' : '📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 3 }}>{lesson.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{lesson.type}{lesson.duration > 0 ? ` · ${lesson.duration} min` : ''}</div>
                    </div>
                    <button onClick={() => deleteLesson(lesson._id)} style={{ padding: '6px 14px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, color: '#ff6060', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                      Delete
                    </button>
                  </div>
                  {lesson.type === 'video' && lesson.content && (
                    <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', maxWidth: 480 }}>
                      <iframe width="100%" height="100%" src={lesson.content} title={lesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: 'block' }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ADD LESSON TAB */}
        {activeTab === 'addLesson' && (
          <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 28 }}>🎬 Add New Lesson</h2>
            <div style={{ padding: '14px 18px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 14, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#00d4ff', marginBottom: 6 }}>💡 How to add a video</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                1. Upload your video to <strong style={{ color: 'white' }}>YouTube</strong> (can be Unlisted)<br />
                2. Copy the video URL<br />
                3. Paste it below — we'll embed it here
              </div>
            </div>
            <form onSubmit={addLesson} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Lesson Title *</label>
                <input style={inp} placeholder="e.g. Introduction to Chords" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Type</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={lessonForm.type} onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}>
                    <option value="video">🎥 Video (YouTube)</option>
                    <option value="text">📝 Notes / Text</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Duration (min)</label>
                  <input style={inp} type="number" min="0" placeholder="10" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} onFocus={focus} onBlur={blur} />
                </div>
              </div>
              {lessonForm.type === 'video' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>YouTube Video URL *</label>
                  <input style={inp} placeholder="https://www.youtube.com/watch?v=..." value={lessonForm.youtubeUrl} onChange={e => setLessonForm({ ...lessonForm, youtubeUrl: e.target.value })} onFocus={focus} onBlur={blur} />
                  {lessonForm.youtubeUrl && (
                    <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
                      <iframe width="100%" height="100%" src={getYouTubeEmbedUrl(lessonForm.youtubeUrl)} title="Preview" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: 'block' }} />
                    </div>
                  )}
                </div>
              )}
              {lessonForm.type === 'text' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Lesson Content</label>
                  <textarea style={{ ...inp, minHeight: 150, resize: 'vertical' }} placeholder="Write your lesson content here..." value={lessonForm.content || ''} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} onFocus={focus} onBlur={blur} />
                </div>
              )}
              <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'rgba(123,94,167,0.4)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? '⏳ Adding...' : '+ Add Lesson'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}