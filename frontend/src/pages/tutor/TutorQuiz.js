import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function TutorQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState([]);

  useEffect(() => {
    API.get(`/quiz/${courseId}`).then(r => setExisting(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [courseId]);

  const addQ = () => setQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const updateQ = (i, field, val) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOpt = (qi, oi, val) => setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? val : o) } : q));
  const removeQ = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));

  const save = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return toast.error('Enter a quiz title');
    for (const q of questions) {
      if (!q.question.trim()) return toast.error('Fill all questions');
      if (q.options.some(o => !o.trim())) return toast.error('Fill all options');
      if (!q.correctAnswer) return toast.error('Select correct answers');
    }
    setLoading(true);
    try {
      await API.post(`/quiz/${courseId}`, { title: quizTitle, questions });
      toast.success('Quiz created! ✅');
      navigate('/tutor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  const inp = { width: '100%', padding: '11px 14px', background: 'rgba(20,16,34,0.8)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 10, color: 'white', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' };
  const focus = e => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.12)'; };
  const blur = e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', padding: '40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => navigate('/tutor')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 32 }}>← Back</button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>🧠 Create Quiz</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Add a quiz to your course to boost engagement</p>

        {existing.length > 0 && (
          <div style={{ padding: '14px 18px', background: 'rgba(45,224,142,0.06)', border: '1px solid rgba(45,224,142,0.15)', borderRadius: 14, marginBottom: 24, fontSize: 13, color: 'var(--green)' }}>
            ✅ This course already has {existing.length} quiz{existing.length > 1 ? 'zes' : ''}. Adding another one:
          </div>
        )}

        <form onSubmit={save}>
          <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Quiz Title</label>
            <input style={inp} placeholder="e.g. Guitar Basics Quiz" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required onFocus={focus} onBlur={blur} />
          </div>

          {questions.map((q, qi) => (
            <div key={qi} style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>Question {qi + 1}</div>
                {questions.length > 1 && <button type="button" onClick={() => removeQ(qi)} style={{ padding: '5px 12px', background: 'rgba(255,96,96,0.1)', border: '1px solid rgba(255,96,96,0.2)', borderRadius: 8, color: '#ff6060', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>Remove</button>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Question Text</label>
                <input style={inp} placeholder="What is...?" value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} required onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Option {['A','B','C','D'][oi]}</label>
                    <input style={{ ...inp, borderColor: q.correctAnswer === opt && opt ? 'rgba(45,224,142,0.4)' : 'rgba(255,255,255,0.07)' }} placeholder={`Option ${['A','B','C','D'][oi]}`} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} required onFocus={focus} onBlur={blur} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Correct Answer</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={q.correctAnswer} onChange={e => updateQ(qi, 'correctAnswer', e.target.value)} required>
                  <option value="">-- Select correct option --</option>
                  {q.options.filter(o => o.trim()).map((opt, oi) => (
                    <option key={oi} value={opt}>{['A','B','C','D'][oi]}. {opt}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQ} style={{ width: '100%', padding: '13px', background: 'rgba(123,94,167,0.08)', border: '1.5px dashed rgba(123,94,167,0.3)', borderRadius: 16, color: 'var(--violet-bright)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: 16 }}>
            + Add Question
          </button>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? 'rgba(123,94,167,0.3)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 16, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 24px rgba(123,94,167,0.3)' }}>
            {loading ? 'Saving...' : '✅ Save Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}
