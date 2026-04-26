import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const games = [
  {
    id: 'dbms',
    title: 'DBMS Quest',
    subtitle: 'Database Mastery Adventure',
    description: 'Master database concepts through an epic 4-level adventure. Learn SQL, normalization, ER diagrams, and more while earning XP!',
    icon: '🗄️',
    color: '#7b5ea7',
    accent: '#9d7fd4',
    tag: 'Technology',
    levels: 4,
    xp: 200,
    difficulty: 'Intermediate',
    topics: ['SQL Queries', 'ER Diagrams', 'Normalization', 'Transactions'],
    available: true,
    htmlPath: '/game/dbms/index.html',
  },
  {
    id: 'piano',
    title: 'Piano Master',
    subtitle: 'Music Learning Game',
    description: 'Learn to play piano through interactive challenges. Train your ear, master notes, and unlock music theory secrets!',
    icon: '🎹',
    color: '#e8547a',
    accent: '#ff7a9a',
    tag: 'Music',
    levels: 5,
    xp: 150,
    difficulty: 'Beginner',
    topics: ['Music Notes', 'Rhythm', 'Chords', 'Ear Training'],
    available: true,
    htmlPath: '/game/piano/index.html',
  },
  {
    id: 'coming1',
    title: 'Code Runner',
    subtitle: 'Programming Challenges',
    description: 'Race against time solving coding puzzles. Earn XP for every problem you crack!',
    icon: '⚡', color: '#00d4ff', accent: '#40e0ff', tag: 'Technology',
    levels: 5, xp: 300, difficulty: 'Advanced',
    topics: ['Algorithms', 'Data Structures', 'Problem Solving'],
    available: false,
  },
  {
    id: 'coming2',
    title: 'Math Galaxy',
    subtitle: 'Mathematical Universe',
    description: 'Explore the universe of mathematics through interactive puzzles and challenges.',
    icon: '🌌', color: '#2de08e', accent: '#50f0a0', tag: 'Science',
    levels: 6, xp: 250, difficulty: 'Beginner',
    topics: ['Algebra', 'Geometry', 'Statistics'],
    available: false,
  },
];

const difficultyColor = { Beginner: '#2de08e', Intermediate: '#f0c040', Advanced: '#e8547a' };

export default function GamePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredGame, setHoveredGame] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#07060f', color: 'white' }}>
      {/* Nav */}
      <div style={{ padding: '16px 32px', background: 'rgba(7,5,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>← Dashboard</button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
          <span style={{ color: 'white' }}>Inno</span>
          <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 400, marginLeft: 8 }}>/ Learning Games</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(123,94,167,0.3)', borderRadius: 99, marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#9d7fd4', letterSpacing: 1, textTransform: 'uppercase' }}>🎮 Learning Games</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
            Learn by Playing<br />
            <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Earn Real XP</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, maxWidth: 560 }}>Gamified learning experiences designed to make complex topics fun. Complete missions, earn XP, and climb the leaderboard!</p>
        </div>

        {/* XP Banner */}
        <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, rgba(123,94,167,0.15), rgba(232,84,122,0.1))', border: '1px solid rgba(123,94,167,0.25)', borderRadius: 20, marginBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>⭐</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 2 }}>Your current XP: <span style={{ color: '#ffd700' }}>{user?.xp || 0} XP</span></div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Complete game missions to earn more XP and climb the leaderboard!</div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>View Leaderboard →</button>
        </div>

        {/* Available Games */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>▶ Available Now — {games.filter(g => g.available).length} Games</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {games.filter(g => g.available).map(game => (
              <div key={game.id}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                style={{ background: 'rgba(14,11,26,0.8)', border: `1px solid ${hoveredGame === game.id ? game.color + '60' : 'rgba(255,255,255,0.08)'}`, borderRadius: 24, overflow: 'hidden', transition: 'all 0.3s', transform: hoveredGame === game.id ? 'translateY(-6px)' : 'translateY(0)', boxShadow: hoveredGame === game.id ? `0 20px 60px ${game.color}25` : 'none' }}>
                <div style={{ height: 160, background: `linear-gradient(135deg, ${game.color}40, ${game.accent}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ fontSize: 72 }}>{game.icon}</div>
                  <div style={{ position: 'absolute', top: 14, right: 14, padding: '4px 12px', background: 'rgba(45,224,142,0.2)', border: '1px solid rgba(45,224,142,0.4)', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#2de08e' }}>✅ AVAILABLE</div>
                  <div style={{ position: 'absolute', top: 14, left: 14, padding: '4px 12px', background: `${game.color}30`, border: `1px solid ${game.color}50`, borderRadius: 99, fontSize: 11, fontWeight: 700, color: game.accent }}>{game.tag}</div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'white' }}>{game.title}</h3>
                  <div style={{ fontSize: 13, color: game.accent, fontWeight: 600, marginBottom: 12 }}>{game.subtitle}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>{game.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {game.topics.map(topic => (
                      <span key={topic} style={{ padding: '3px 10px', background: `${game.color}15`, border: `1px solid ${game.color}30`, borderRadius: 99, fontSize: 11, fontWeight: 600, color: game.accent }}>{topic}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 20, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 800, color: '#ffd700' }}>+{game.xp}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Max XP</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{game.levels}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Levels</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 15, fontWeight: 800, color: difficultyColor[game.difficulty] }}>{game.difficulty}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Difficulty</div></div>
                  </div>
                  <button onClick={() => window.location.href = game.htmlPath}
                    style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, ${game.color}, ${game.accent})`, border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'inherit', boxShadow: `0 4px 20px ${game.color}40` }}>
                    🎮 Play Now — Earn XP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>🔒 Coming Soon</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {games.filter(g => !g.available).map(game => (
              <div key={game.id} style={{ background: 'rgba(14,11,26,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden', opacity: 0.7 }}>
                <div style={{ height: 100, background: `linear-gradient(135deg, ${game.color}20, ${game.accent}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                  {game.icon}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 28 }}>🔒</span></div>
                </div>
                <div style={{ padding: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'rgba(255,255,255,0.6)' }}>{game.title}</h3>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{game.subtitle}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>🏆 +{game.xp} XP</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>📊 {game.levels} levels</span>
                    <span style={{ fontSize: 12, color: difficultyColor[game.difficulty] + '80' }}>{game.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
