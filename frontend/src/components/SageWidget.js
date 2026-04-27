import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function SageWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm Sage, your AI learning companion. Ask me anything about your courses, study tips, or how to earn more XP!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const { data } = await API.post('/chat', { messages: [...history, { role: 'user', content: msg }] });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I'm having trouble right now. Try again!" }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again! 🙏" }]);
    }
    setLoading(false);
  };

  const suggestions = ['How do I earn XP faster?', 'Give me study tips', 'What courses should I take?'];

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div style={{ position: 'fixed', bottom: 90, right: 24, width: 360, height: 500, background: '#0e0b1a', border: '1px solid rgba(123,94,167,0.4)', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'scale-in 0.2s ease' }}>
          
          {/* Header */}
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(123,94,167,0.3), rgba(232,84,122,0.2))', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#00d4ff,#7b5ea7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>Sage AI</div>
              <div style={{ fontSize: 11, color: '#2de08e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2de08e', display: 'inline-block' }} />
                Always online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontSize: 16 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg,#7b5ea7,#e8547a)' : 'linear-gradient(135deg,#00d4ff,#7b5ea7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: msg.role === 'user' ? 12 : 16, color: 'white', fontWeight: 900 }}>
                  {msg.role === 'user' ? user?.name?.[0]?.toUpperCase() : '🤖'}
                </div>
                <div style={{ maxWidth: '80%', padding: '10px 14px', background: msg.role === 'user' ? 'linear-gradient(135deg,rgba(123,94,167,0.4),rgba(232,84,122,0.3))' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (msg.role === 'user' ? 'rgba(123,94,167,0.3)' : 'rgba(255,255,255,0.08)'), borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#00d4ff,#7b5ea7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', animation: 'pulse 1s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{ padding: '5px 12px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 99, color: '#00d4ff', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Sage anything..." style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '10px 16px', background: input.trim() && !loading ? 'linear-gradient(135deg,#00d4ff,#7b5ea7)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 12, color: input.trim() ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 700 }}>→</button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: open ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#00d4ff,#7b5ea7)', border: 'none', cursor: 'pointer', fontSize: 24, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,212,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}