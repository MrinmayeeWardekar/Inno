// ============================================================
// RecommendedCourses.js
// 
// WHERE TO PUT THIS FILE:
//   frontend/src/components/RecommendedCourses.js
//   (create the components folder first - right-click src → New Folder → "components")
//
// HOW TO USE IN LearnerDashboard.js:
//   import RecommendedCourses from '../components/RecommendedCourses';
//   Then add <RecommendedCourses /> anywhere inside your JSX
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // your project uses react-router v5
import API from '../api/axios'; // uses YOUR existing axios.js - no new imports needed

export default function RecommendedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await API.get('/recommendations');
        setCourses(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div style={styles.section}>
        <h2 style={styles.heading}>Recommended for you</h2>
        <div style={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      </div>
    );
  }

  if (!courses.length) return null;

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Recommended for you</h2>
      <p style={styles.subheading}>Based on your learning history</p>
      <div style={styles.grid}>
        {courses.map((course) => (
          <div
            key={course._id}
            style={styles.card}
            onClick={() => navigate(`/course/${course._id}`)}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Thumbnail */}
            <div style={styles.thumbBox}>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} style={styles.thumb} />
              ) : (
                <div style={styles.thumbPlaceholder}>🎓</div>
              )}
              <span style={{ ...styles.levelBadge, ...getLevelStyle(course.level) }}>
                {course.level || 'All levels'}
              </span>
            </div>

            {/* Details */}
            <div style={styles.body}>
              <p style={styles.category}>{course.category}</p>
              <h3 style={styles.title}>{course.title}</h3>
              <p style={styles.instructor}>by {course.tutor?.name || 'Instructor'}</p>

              <div style={styles.ratingRow}>
                <span style={styles.stars}>{getStars(course.rating)}</span>
                <span style={styles.ratingText}>
                  {course.rating ? course.rating.toFixed(1) : 'New'}
                </span>
              </div>

              <div style={styles.priceRow}>
                {course.price === 0 ? (
                  <span style={styles.free}>Free</span>
                ) : (
                  <span style={styles.price}>₹{course.price}</span>
                )}
                {course._score !== undefined && (
                  <span style={styles.matchBadge}>
                    {Math.round(course._score * 100)}% match
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function getStars(rating) {
  const r = Math.round(rating || 0);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

function getLevelStyle(level) {
  const map = {
    beginner:     { background: '#e1f5ee', color: '#0f6e56' },
    intermediate: { background: '#faeeda', color: '#854f0b' },
    advanced:     { background: '#faece7', color: '#993c1d' },
  };
  return map[level] || { background: '#f1efe8', color: '#5f5e5a' };
}

// ── Styles ───────────────────────────────────────────────────

const styles = {
  section: {
    margin: '32px 0',
  },
  heading: {
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 4px',
  },
  subheading: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  thumbBox: {
    position: 'relative',
    height: '140px',
  },
  thumb: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    display: 'block',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '140px',
    background: '#e1f5ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
  },
  levelBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  body: {
    padding: '12px 14px 14px',
  },
  category: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#0f6e56',
    margin: '0 0 4px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 600,
    margin: '0 0 4px',
    lineHeight: 1.3,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  instructor: {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 8px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
  },
  stars: {
    color: '#BA7517',
    fontSize: '13px',
  },
  ratingText: {
    fontSize: '13px',
    color: '#555',
    fontWeight: 500,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  free: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f6e56',
  },
  price: {
    fontSize: '16px',
    fontWeight: 700,
  },
  matchBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '20px',
    background: '#EEEDFE',
    color: '#3C3489',
  },
  skeleton: {
    height: '280px',
    borderRadius: '12px',
    background: '#f0f0f0',
  },
};