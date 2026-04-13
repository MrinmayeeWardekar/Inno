import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Stars = ({ rating, size = 18, interactive = false, onChange }) => (
  <span style={{ fontSize: size, letterSpacing: 2, cursor: interactive ? 'pointer' : 'default' }}>
    {[1,2,3,4,5].map(s => (
      <span key={s}
        onClick={() => interactive && onChange && onChange(s)}
        onMouseEnter={e => { if (interactive) e.target.style.transform = 'scale(1.2)'; }}
        onMouseLeave={e => { if (interactive) e.target.style.transform = 'scale(1)'; }}
        style={{ color: s <= Math.round(rating) ? '#f0c040' : 'rgba(255,255,255,0.15)', display: 'inline-block', transition: 'transform 0.1s' }}>★</span>
    ))}
  </span>
);

export default function ReviewsSection({ courseId, isEnrolled }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ rating: 5, teachingRating: 5, clarityRating: 5, valueRating: 5, review: '' });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    API.get(`/reviews/${courseId}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [courseId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.review.trim()) return toast.error('Please write a review');
    setSubmitting(true);
    try {
      await API.post(`/reviews/${courseId}`, form);
      toast.success('Review submitted! ⭐');
      setShowForm(false);
      setForm({ rating: 5, teachingRating: 5, clarityRating: 5, valueRating: 5, review: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
    setSubmitting(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading reviews...</div>;

  return (
    <div style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>⭐ Student Reviews</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{data?.total || 0} review{data?.total !== 1 ? 's' : ''}</p>
          </div>
          {isEnrolled && !showForm && (
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
              + Write Review
            </button>
          )}
        </div>

        {/* Summary */}
        {data?.total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, background: 'rgba(240,192,64,0.05)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 20, padding: '24px 28px', marginBottom: 28, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{data.avg}</div>
              <Stars rating={data.avg} size={20} />
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>overall rating</div>
            </div>
            <div>
              {/* Bar chart */}
              {data.dist?.map(d => (
                <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', minWidth: 32 }}>{d.star}★</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${d.percent}%`, height: '100%', background: 'linear-gradient(90deg,#f0c040,#e8a020)', borderRadius: 99, transition: 'width 1s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', minWidth: 28 }}>{d.count}</span>
                </div>
              ))}
              {/* Component scores */}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {[['Teaching', data.teachingAvg], ['Clarity', data.clarityAvg], ['Value', data.valueAvg]].map(([label, val]) => (
                  <div key={label} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Write Review Form */}
        {showForm && (
          <div style={{ background: 'rgba(123,94,167,0.06)', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 20, padding: 28, marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Write Your Review</h3>
            <form onSubmit={submit}>
              {/* Overall */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Overall Rating *</label>
                <Stars rating={form.rating} size={32} interactive onChange={v => setForm({ ...form, rating: v })} />
              </div>
              {/* Component ratings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[['Teaching', 'teachingRating'], ['Clarity', 'clarityRating'], ['Value', 'valueRating']].map(([label, key]) => (
                  <div key={key} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                    <Stars rating={form[key]} size={20} interactive onChange={v => setForm({ ...form, [key]: v })} />
                  </div>
                ))}
              </div>
              {/* Text */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Your Review *</label>
                <textarea value={form.review} onChange={e => setForm({ ...form, review: e.target.value })} placeholder="Share your experience with this course..." style={{ width: '100%', height: 120, resize: 'vertical', padding: '12px 16px', background: 'rgba(20,16,34,0.8)', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 12, color: 'white', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} required maxLength={1000} />
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, textAlign: 'right' }}>{form.review.length}/1000</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: submitting ? 'rgba(123,94,167,0.3)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'var(--font-body)' }}>
                  {submitting ? 'Submitting...' : 'Submit Review ⭐'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Review list */}
        {data?.reviews?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet.{isEnrolled ? ' Be the first!' : ' Enroll to leave a review.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data?.reviews?.map((r, i) => (
              <div key={i} style={{ padding: '20px 24px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(240,192,64,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                    {r.learner?.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: 'white' }}>{r.learner?.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stars rating={r.rating} size={14} />
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {/* Component mini scores */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                      {[['Teaching', r.teachingRating], ['Clarity', r.clarityRating], ['Value', r.valueRating]].map(([label, val]) => val && (
                        <span key={label} style={{ padding: '2px 10px', background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.18)', borderRadius: 99, fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>{label}: {val}★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{r.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
