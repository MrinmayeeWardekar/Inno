import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';
const ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function TutorLive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [viewers, setViewers] = useState(0);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const videoRef = useRef(null);
  const peerRefs = useRef({});
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    socketRef.current.on('viewerCount', count => setViewers(count));
    socketRef.current.on('chatMessage', msg => setChatMessages(prev => [...prev.slice(-49), msg]));

    socketRef.current.on('viewerJoined', async ({ viewerId }) => {
      if (!stream) return;
      const pc = new RTCPeerConnection({ iceServers: ICE });
      peerRefs.current[viewerId] = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.onicecandidate = e => { if (e.candidate) socketRef.current.emit('iceCandidate', { to: viewerId, candidate: e.candidate }); };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', { to: viewerId, offer });
    });

    socketRef.current.on('answer', async ({ from, answer }) => {
      await peerRefs.current[from]?.setRemoteDescription(answer);
    });

    socketRef.current.on('iceCandidate', async ({ from, candidate }) => {
      await peerRefs.current[from]?.addIceCandidate(candidate);
    });

    return () => {
      socketRef.current?.disconnect();
      clearInterval(timerRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const startLive = async () => {
    if (!title.trim()) return toast.error('Enter a session title');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;

      const { data } = await API.post('/live/start', { title });
      setRoomId(data.roomId);
      setIsLive(true);

      socketRef.current.emit('startLive', { roomId: data.roomId, tutorId: user._id, title });

      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      toast.success('You are live! 🔴');
    } catch (err) {
      toast.error('Camera/mic access denied or failed to start');
    }
  };

  const endLive = async () => {
    stream?.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);
    if (roomId) { socketRef.current.emit('endLive', { roomId }); await API.post('/live/end', { roomId }).catch(() => {}); }
    setIsLive(false); setRoomId(null); setStream(null); setDuration(0); setViewers(0); setChatMessages([]);
    toast.success('Session ended 👏');
    navigate('/tutor');
  };

  const sendChat = () => {
    if (!chatInput.trim() || !roomId) return;
    socketRef.current.emit('chatMessage', { roomId, message: chatInput, from: user.name, role: 'tutor' });
    setChatInput('');
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 32px', background: 'rgba(7,5,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <button onClick={() => isLive ? endLive() : navigate('/tutor')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
          {isLive ? '← End Session' : '← Back'}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>
            {isLive ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff2020', display: 'inline-block', animation: 'pulse-glow 1s infinite', boxShadow: '0 0 10px #ff2020' }} />
                LIVE — {title}
              </span>
            ) : 'Start Live Session 🔴'}
          </div>
        </div>
        {isLive && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#ff2020' }}>{viewers}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>viewers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>{fmt(duration)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>duration</div>
            </div>
            <button onClick={endLive} style={{ padding: '10px 24px', background: 'rgba(220,30,30,0.2)', border: '1px solid rgba(220,30,30,0.4)', borderRadius: 12, color: '#ff4444', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-body)' }}>
              End Live
            </button>
          </div>
        )}
      </div>

      {!isLive ? (
        /* Pre-live setup */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 4s ease-in-out infinite', display: 'inline-block' }}>🎙️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.5px' }}>Ready to go live?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 15 }}>Your enrolled students will receive a notification the moment you start.</p>
            <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Session Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Live Q&A — Guitar Chords" style={{ marginBottom: 24, fontSize: 16, padding: '14px 18px' }} onKeyDown={e => e.key === 'Enter' && startLive()} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['🎥 Camera and microphone access required', '📡 Students enrolled in your courses will be notified', '💬 Live chat is available during your session'].map((tip, i) => (
                  <div key={i} style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>{tip}</div>
                ))}
              </div>
              <button onClick={startLive} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #cc1f1f, #e8547a)', border: 'none', borderRadius: 16, color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-body)', boxShadow: '0 4px 30px rgba(200,30,30,0.4)', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 10px 40px rgba(200,30,30,0.5)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 30px rgba(200,30,30,0.4)'; }}>
                🔴 Go Live Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Live layout */
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
          {/* Video */}
          <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,0,0,0.7)', borderRadius: 99, backdropFilter: 'blur(8px)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2020', display: 'inline-block', animation: 'pulse-glow 1s infinite' }} />
              <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>LIVE</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>· {viewers} watching</span>
            </div>
          </div>

          {/* Chat */}
          <div style={{ background: 'rgba(7,5,15,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>💬 Live Chat</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 40 }}>No messages yet — say hi!</div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ padding: '10px 12px', background: msg.role === 'tutor' ? 'rgba(232,84,122,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: 12, border: msg.role === 'tutor' ? '1px solid rgba(232,84,122,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: msg.role === 'tutor' ? 'var(--pink)' : 'var(--violet-bright)', marginBottom: 3 }}>{msg.from} {msg.role === 'tutor' ? '👑' : ''}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{msg.message}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Say something..." style={{ flex: 1, fontSize: 13, padding: '10px 14px' }} onKeyDown={e => e.key === 'Enter' && sendChat()} />
              <button onClick={sendChat} style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#e8547a,#f0c040)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 700 }}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
