import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

// Floating particle component
const Particle = ({ style }) => <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', animation: `particle-float ${style.duration}s ease-in ${style.delay}s infinite`, ...style }} />;

// 3D Tilt Card
const TiltCard = ({ children, style }) => {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateZ(10px)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
  };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  );
};

const StatCard = ({ value, suffix, label, icon }) => {
  const [ref, inView] = useInView({ triggerOnce: true });
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(123,94,167,0.08)', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, background: 'linear-gradient(135deg, #9d7fd4, #e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {inView ? <CountUp end={value} duration={2.5} separator="," suffix={suffix} /> : '0'}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

const features = [
  { icon: '⚡', title: 'Earn XP Every Lesson', desc: 'Every video watched, quiz aced, and session joined earns you experience points that level you up.', color: '#f0c040' },
  { icon: '🏆', title: 'Global Leaderboard', desc: 'Compete with thousands of learners worldwide. Rise to the top and earn legendary badges.', color: '#9d7fd4' },
  { icon: '🔴', title: 'Live Sessions', desc: 'Join real-time sessions with expert tutors. Ask questions, get answers, learn together.', color: '#e8547a' },
  { icon: '🤖', title: 'AI Learning Assistant', desc: 'Sage, your personal AI tutor, guides you through any topic 24/7 with smart suggestions.', color: '#00d4ff' },
  { icon: '🎓', title: 'Earn Certificates', desc: 'Complete courses and download beautiful verified certificates to showcase your skills.', color: '#2de08e' },
  { icon: '💰', title: 'Teach & Earn', desc: 'Share your expertise. Create courses, build a following, and earn 80% of every enrollment.', color: '#f0c040' },
];

const courses = [
  { emoji: '🎸', title: 'Guitar Mastery', tutor: 'Arjun Sharma', students: 1240, rating: 4.9, tag: 'Music', color: '#7b5ea7' },
  { emoji: '💻', title: 'Full Stack Dev', tutor: 'Priya Mehta', students: 3800, rating: 4.8, tag: 'Technology', color: '#e8547a' },
  { emoji: '🎨', title: 'UI/UX Design', tutor: 'Kavya Nair', students: 2100, rating: 4.9, tag: 'Design', color: '#00d4ff' },
  { emoji: '🔐', title: 'Cybersecurity', tutor: 'Rahul Dev', students: 980, rating: 4.7, tag: 'Technology', color: '#2de08e' },
  { emoji: '🎤', title: 'Public Speaking', tutor: 'Sneha Iyer', students: 1560, rating: 4.8, tag: 'Life Skills', color: '#f0c040' },
  { emoji: '🍳', title: 'Gourmet Cooking', tutor: 'Chef Ravi', students: 870, rating: 4.9, tag: 'Life Skills', color: '#e8547a' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouse); };
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    width: Math.random() * 4 + 1, height: Math.random() * 4 + 1,
    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    background: ['#7b5ea7','#e8547a','#00d4ff','#2de08e'][i % 4],
    opacity: Math.random() * 0.5 + 0.2,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrollY > 50 ? 'rgba(3,2,10,0.9)' : 'transparent', backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none', borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s ease' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>
          <span style={{ color: 'white' }}>Inno</span>
          <span style={{ background: 'linear-gradient(135deg, #9d7fd4, #e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.06)'}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7b5ea7, #e8547a)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(123,94,167,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(123,94,167,0.5)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(123,94,167,0.4)'; }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        {/* Background orbs that follow mouse */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,94,167,0.15), transparent 70%)', transform: `translate(${mousePos.x * 40 - 20}px, ${mousePos.y * 40 - 20}px)`, transition: 'transform 0.5s ease', top: '10%', left: '5%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,84,122,0.1), transparent 70%)', transform: `translate(${-mousePos.x * 30 + 15}px, ${-mousePos.y * 30 + 15}px)`, transition: 'transform 0.5s ease', bottom: '10%', right: '5%', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {particles.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(123,94,167,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(123,94,167,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        {/* Hero Content */}
        <div style={{ textAlign: 'center', maxWidth: 900, padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(123,94,167,0.3)', borderRadius: 99, marginBottom: 32, fontSize: 13, fontWeight: 600, color: 'var(--violet-bright)', animation: 'slide-up 0.6s ease forwards' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2de08e', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            Now in Beta · 10,000+ learners already leveling up
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 28, animation: 'slide-up 0.6s 0.1s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
            Learn. Level Up.<br />
            <span style={{ background: 'linear-gradient(135deg, #9d7fd4 0%, #e8547a 50%, #00d4ff 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient-shift 3s ease infinite' }}>
              Become Legendary.
            </span>
          </h1>

          <p style={{ fontSize: 20, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7, animation: 'slide-up 0.6s 0.2s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
            The world's first gamified learning platform where every lesson earns XP, every milestone unlocks badges, and the top learners rule the leaderboard.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animation: 'slide-up 0.6s 0.3s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #7b5ea7, #e8547a)', border: 'none', borderRadius: 16, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 16, boxShadow: '0 8px 40px rgba(123,94,167,0.5)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-4px) scale(1.02)'; e.target.style.boxShadow = '0 16px 60px rgba(123,94,167,0.6)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 40px rgba(123,94,167,0.5)'; }}>
              Start Your Journey — Free 🚀
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '16px 40px', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 16, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
              Sign In
            </button>
          </div>

          {/* Floating achievement cards */}
          <div style={{ position: 'relative', marginTop: 80, height: 120 }}>
            {[
              { label: '+50 XP Earned!', icon: '⭐', color: '#f0c040', left: '5%', top: 0, delay: '0s' },
              { label: 'Badge Unlocked!', icon: '🏅', color: '#9d7fd4', left: '50%', top: -20, delay: '0.5s' },
              { label: 'Level 5 Reached!', icon: '🎯', color: '#2de08e', right: '5%', top: 10, delay: '1s' },
            ].map((card, i) => (
              <div key={i} style={{ position: 'absolute', ...card, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: 'rgba(14,11,26,0.9)', border: `1px solid ${card.color}40`, borderRadius: 99, backdropFilter: 'blur(20px)', fontSize: 13, fontWeight: 700, color: card.color, animation: `float ${3 + i}s ease-in-out infinite`, animationDelay: card.delay, transform: card.left === '50%' ? 'translateX(-50%)' : 'none', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 18 }}>{card.icon}</span> {card.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <StatCard value={10000} suffix="+" label="Active Learners" icon="🎓" />
          <StatCard value={500} suffix="+" label="Expert Tutors" icon="👨‍🏫" />
          <StatCard value={1200} suffix="+" label="Courses Live" icon="📚" />
          <StatCard value={98} suffix="%" label="Satisfaction Rate" icon="⭐" />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 16 }}>
            Everything you need to <span style={{ background: 'linear-gradient(135deg, #9d7fd4, #e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>level up</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>Built for the next generation of learners who want more than just videos.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <TiltCard key={i} style={{ padding: '32px', background: 'rgba(14,11,26,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, cursor: 'default', transition: 'border-color 0.3s' }}
              onMouseEnter={() => {}} onMouseLeave={() => {}}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 10, color: 'white' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* COURSE SHOWCASE */}
      <section style={{ padding: '80px 48px', maxWidth: 1400, margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 16 }}>
            Explore <span style={{ background: 'linear-gradient(135deg, #00d4ff, #9d7fd4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>1,200+ courses</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {courses.map((c, i) => (
            <TiltCard key={i} style={{ background: 'rgba(14,11,26,0.8)', border: `1px solid ${c.color}30`, borderRadius: 24, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}>
              <div style={{ height: 140, background: `linear-gradient(135deg, ${c.color}30, ${c.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                {c.emoji}
              </div>
              <div style={{ padding: '20px 24px' }}>
                <span className="badge badge-violet" style={{ marginBottom: 10, display: 'inline-block' }}>{c.tag}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'white' }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>by <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{c.tutor}</strong></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>👥 {c.students.toLocaleString()}</span>
                  <span style={{ color: c.color, fontWeight: 700, fontSize: 14 }}>⭐ {c.rating}</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(123,94,167,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 24, lineHeight: 1.1 }}>
            Your next level<br />is waiting for you
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 48 }}>Join thousands of learners who are already earning XP, unlocking badges, and building real skills every day.</p>
          <button onClick={() => navigate('/register')} style={{ padding: '18px 56px', background: 'linear-gradient(135deg, #7b5ea7, #e8547a)', border: 'none', borderRadius: 18, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 18, boxShadow: '0 8px 60px rgba(123,94,167,0.5)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-4px) scale(1.03)'; e.target.style.boxShadow = '0 20px 80px rgba(123,94,167,0.6)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 60px rgba(123,94,167,0.5)'; }}>
            Begin Your Adventure — Free 🚀
          </button>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: 'white' }}>Inno</span>
          <span style={{ background: 'linear-gradient(135deg, #9d7fd4, #e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>© 2025 InnoVenture. Built with 💜 for the next generation of learners.</p>
      </footer>

      <style>{`
        @keyframes particle-float {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-20px) scale(1); opacity: 0; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
