import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/quiz/${courseId}`).then(r => { setQuizzes(Array.isArray(r.data) ? r.data : []); setLoading(false); }).catch(() => setLoading(false));
  }, [courseId]);

  const startQuiz = (quiz) => { setActiveQuiz(quiz); setCurrent(0); setSelected(null); setScore(0); setDone(false); setAnswers([]); };

  const answer = async (opt) => {
    setSelected(opt);
    const q = activeQuiz.questions[current];
    const correct = opt === q.correctAnswer;
    setAnswers(prev => [...prev, { q: q.question, selected: opt, correct, correctAns: q.correctAnswer }]);
    if (correct) setScore(s => s + 1);
    await new Promise(r => setTimeout(r, 800));
    if (current + 1 >= activeQuiz.questions.length) {
      const finalScore = correct ? score + 1 : score;
      const total = activeQuiz.questions.length;
      if (finalScore / total >= 0.8) {
        try { await API.post(`/quiz/${activeQuiz._id}/submit`, { score: finalScore, total }); toast.success(`🎉 +${finalScore * 10} XP earned!`); } catch {}
      }
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 48, animation: 'spin-slow 2s linear infinite' }}>⚡</div></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', padding: 40 }}>
      {done && score / activeQuiz.questions.length >= 0.8 && <Confetti recycle={false} numberOfPieces={300} />}
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 32 }}>← Back</button>

        {!activeQuiz && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>🧠 Course Quizzes</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Test your knowledge and earn XP</p>
            {quizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 64, background: 'rgba(14,11,26,0.5)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
                <p style={{ color: 'var(--text-muted)' }}>No quizzes available for this course yet.</p>
              </div>
            ) : quizzes.map(q => (
              <div key={q._id} onClick={() => startQuiz(q)} style={{ padding: '24px', background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,94,167,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(123,94,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🧠</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'white', marginBottom: 6 }}>{q.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.questions?.length || 0} questions · Earn up to {(q.questions?.length || 0) * 10} XP</div>
                </div>
                <div style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', borderRadius: 12, color: 'white', fontWeight: 800, fontSize: 13 }}>Start →</div>
              </div>
            ))}
          </>
        )}

        {activeQuiz && !done && (
          <div style={{ animation: 'scale-in 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Question {current + 1} of {activeQuiz.questions.length}</div>
              <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>Score: {score}/{current}</div>
            </div>
            <div className="xp-track" style={{ marginBottom: 32 }}><div className="xp-fill" style={{ width: `${(current / activeQuiz.questions.length) * 100}%` }} /></div>
            <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 36, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 28, lineHeight: 1.4 }}>{activeQuiz.questions[current].question}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeQuiz.questions[current].options.map((opt, i) => {
                  let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)', color = 'var(--text-muted)';
                  if (selected) {
                    if (opt === activeQuiz.questions[current].correctAnswer) { bg = 'rgba(45,224,142,0.12)'; border = 'rgba(45,224,142,0.4)'; color = 'var(--green)'; }
                    else if (opt === selected && opt !== activeQuiz.questions[current].correctAnswer) { bg = 'rgba(255,96,96,0.1)'; border = 'rgba(255,96,96,0.3)'; color = '#ff6060'; }
                  }
                  return (
                    <div key={i} onClick={() => !selected && answer(opt)} style={{ padding: '16px 20px', background: bg, border: `2px solid ${border}`, borderRadius: 16, cursor: selected ? 'default' : 'pointer', color, fontWeight: 600, fontSize: 15, transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: 12 }}
                      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(123,94,167,0.4)'; }}
                      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                        {['A','B','C','D'][i]}
                      </span>
                      {opt}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {done && (
          <div style={{ textAlign: 'center', animation: 'scale-in 0.4s ease' }}>
            <div style={{ fontSize: 80, marginBottom: 20, display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>
              {score / activeQuiz.questions.length >= 0.8 ? '🏆' : score / activeQuiz.questions.length >= 0.5 ? '⭐' : '📚'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
              {score / activeQuiz.questions.length >= 0.8 ? 'Excellent!' : score / activeQuiz.questions.length >= 0.5 ? 'Good effort!' : 'Keep practicing!'}
            </h2>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 700, background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
              {score}/{activeQuiz.questions.length}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
              {score >= Math.ceil(activeQuiz.questions.length * 0.8) ? `🎉 +${score * 10} XP earned!` : 'Score 80%+ to earn XP'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => startQuiz(activeQuiz)} style={{ padding: '13px 28px', background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(123,94,167,0.3)', borderRadius: 14, color: 'var(--violet-bright)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}>🔄 Try Again</button>
              <button onClick={() => navigate(-1)} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}>← Back to Course</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
