import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const suggestions = [
  'How do I improve at guitar faster?',
  'What should I learn after HTML/CSS?',
  'How do I stay motivated to keep learning?',
  'Explain recursion like I\'m 10',
  'Give me a 30-day study plan for web dev',
];

export default function SageChat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm **Sage**, your AI learning companion on InnoVenture.\n\nI can help you:\n• Understand complex topics instantly\n• Create personalized study plans\n• Recommend courses based on your goals\n• Answer any learning questions 24/7\n\nWhat would you like to explore today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { data } = await API.post('/chat', { messages: [...history, { role: 'user', content: msg }] });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.message || 'Sorry, I had trouble with that. Try again!' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment! 🙏" }]);
    }
    setLoading(false);
  };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('• ') || line.startsWith('- ')) return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span style={{ color: 'var(--violet-bright)', flexShrink: 0 }}>•</span><span>{line.substring(2)}</span></div>;
      if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} style={{ color: 'white', display: 'block', marginBottom: 4 }}>{line.slice(2, -2)}</strong>;
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} style={{ margin: '0 0 6px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'rgba(7,5,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 0', flexShrink: 0, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: 'white' }}>Inno</span><span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
          </div>
        </div>
        {[{ icon: '⚡', label: 'Dashboard', path: '/dashboard' }, { icon: '📚', label: 'Courses', path: '/courses' }, { icon: '🔴', label: 'Live', path: '/live' }, { icon: '🤖', label: 'Ask Sage', path: '/sage' }].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', color: item.path === '/sage' ? 'var(--cyan)' : 'var(--text-muted)', background: item.path === '/sage' ? 'rgba(0,212,255,0.06)' : 'transparent', fontWeight: 600, fontSize: 14, transition: 'all 0.15s' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 12px 16px' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #00d4ff, #7b5ea7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}>🤖</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>Sage AI</div>
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
              Always online · Powered by Claude
            </div>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: `Fresh start! Hi ${user?.name?.split(' ')[0]}! 👋 How can I help you learn today?` }])} style={{ marginLeft: 'auto', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            🗑️ Clear chat
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'slide-up 0.3s ease' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg,#7b5ea7,#e8547a)' : 'linear-gradient(135deg,#00d4ff,#7b5ea7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: msg.role === 'user' ? 16 : 20, fontWeight: 900, color: 'white', boxShadow: msg.role === 'user' ? 'none' : '0 4px 16px rgba(0,212,255,0.25)' }}>
                {msg.role === 'user' ? user?.name?.[0]?.toUpperCase() : '🤖'}
              </div>
              <div style={{ maxWidth: '72%', padding: '14px 18px', background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(123,94,167,0.3), rgba(232,84,122,0.2))' : 'rgba(14,11,26,0.7)', border: `1px solid ${msg.role === 'user' ? 'rgba(123,94,167,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: msg.role === 'user' ? '20px 6px 20px 20px' : '6px 20px 20px 20px', fontSize: 14, color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)', lineHeight: 1.7, backdropFilter: 'blur(10px)' }}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#00d4ff,#7b5ea7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
              <div style={{ padding: '16px 20px', background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px 20px 20px 20px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse-glow 1s ease-in-out infinite', animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div style={{ padding: '0 32px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ padding: '8px 16px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 99, color: 'var(--cyan)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.target.style.background = 'rgba(0,212,255,0.12)'; e.target.style.borderColor = 'rgba(0,212,255,0.3)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(0,212,255,0.06)'; e.target.style.borderColor = 'rgba(0,212,255,0.15)'; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '20px 32px 28px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', gap: 12, background: 'rgba(14,11,26,0.8)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '8px 8px 8px 20px', transition: 'border-color 0.2s', maxWidth: 900, margin: '0 auto' }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Sage anything about learning..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', boxShadow: 'none', padding: '8px 0' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}} onFocus={e => e.currentTarget.parentElement.style.borderColor = 'var(--cyan)'} onBlur={e => e.currentTarget.parentElement.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '12px 24px', background: input.trim() && !loading ? 'linear-gradient(135deg,#00d4ff,#7b5ea7)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 12, color: input.trim() && !loading ? 'white' : 'var(--text-dim)', cursor: input.trim() && !loading ? 'pointer' : 'default', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', transition: 'all 0.2s', boxShadow: input.trim() ? '0 4px 16px rgba(0,212,255,0.25)' : 'none' }}>
              Send →
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text-dim)' }}>Sage can make mistakes. Always verify important information.</div>
        </div>
      </div>
    </div>
  );
}
