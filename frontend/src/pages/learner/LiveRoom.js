import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = 'https://innoventure-backend.onrender.com';
const ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function LiveRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Live Session');
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('joinRoom', { roomId, userId: user?._id });
    setIsConnected(true);

    socketRef.current.on('viewerCount', count => setViewers(count));
    socketRef.current.on('chatMessage', msg => setChatMessages(prev => [...prev.slice(-49), msg]));
    socketRef.current.on('sessionEnded', () => { toast.error('Session ended by tutor'); navigate('/live'); });
    socketRef.current.on('sessionInfo', info => { if (info?.title) setSessionTitle(info.title); });

    socketRef.current.on('offer', async ({ offer, from }) => {
      pcRef.current = new RTCPeerConnection({ iceServers: ICE });
      pcRef.current.onicecandidate = e => { if (e.candidate) socketRef.current.emit('iceCandidate', { to: from, candidate: e.candidate }); };
      pcRef.current.ontrack = e => { if (videoRef.current) videoRef.current.srcObject = e.streams[0]; };
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { to: from, answer });
    });

    socketRef.current.on('iceCandidate', async ({ from, candidate }) => {
      await pcRef.current?.addIceCandidate(candidate);
    });

    return () => { pcRef.current?.close(); socketRef.current?.disconnect(); };
  }, [roomId, user?._id]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit('chatMessage', { roomId, message: chatInput, from: user?.name, role: 'learner' });
    setChatInput('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Bar */}
      <div style={{ padding: '14px 28px', background: 'rgba(7,5,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate('/live')} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>← Leave</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2020', display: 'inline-block', animation: 'pulse-glow 1s infinite', boxShadow: '0 0 8px #ff2020' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'white' }}>LIVE — {sessionTitle}</span>
          </div>
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>👥 {viewers} watching</div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        {/* Video */}
        <div style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {!isConnected && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 48, animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>⚡</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Connecting to stream...</p>
            </div>
          )}
          {isConnected && !videoRef.current?.srcObject && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 64 }}>🎙️</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Waiting for tutor's video...</p>
            </div>
          )}
        </div>

        {/* Chat */}
        <div style={{ background: 'rgba(7,5,15,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>💬 Live Chat</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chatMessages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 40 }}>Be the first to say hi! 👋</div>}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ padding: '9px 12px', background: msg.role === 'tutor' ? 'rgba(232,84,122,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: 12, border: msg.role === 'tutor' ? '1px solid rgba(232,84,122,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: msg.role === 'tutor' ? 'var(--pink)' : 'var(--violet-bright)', marginBottom: 3 }}>{msg.from} {msg.role === 'tutor' ? '👑' : ''}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{msg.message}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Say something..." style={{ flex: 1, fontSize: 13, padding: '10px 14px' }} onKeyDown={e => e.key === 'Enter' && sendChat()} />
            <button onClick={sendChat} style={{ padding: '10px 16px', background: 'rgba(123,94,167,0.3)', border: '1px solid rgba(123,94,167,0.4)', borderRadius: 12, color: 'var(--violet-bright)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 700 }}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
