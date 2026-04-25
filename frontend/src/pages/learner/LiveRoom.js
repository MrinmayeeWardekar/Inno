import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

const SOCKET_URL = 'https://innoventure-backend.onrender.com';
const ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
];

export default function LiveRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Live Session');
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', { roomId, userId: user?._id, userName: user?.name });
    });

    socketRef.current.on('viewerCount', count => setViewers(count));

    socketRef.current.on('chat-message', ({ message, userName }) => {
      setChatMessages(prev => [...prev.slice(-49), { message, from: userName }]);
    });

    socketRef.current.on('session-ended', () => {
      alert('The tutor has ended this live session.');
      navigate('/dashboard');
    });

    socketRef.current.on('offer', async ({ offer, from }) => {
      pcRef.current = new RTCPeerConnection({ iceServers: ICE });

      pcRef.current.onicecandidate = e => {
        if (e.candidate) {
          socketRef.current.emit('ice-candidate', { to: from, candidate: e.candidate });
        }
      };

      pcRef.current.ontrack = e => {
        if (videoRef.current && e.streams[0]) {
          videoRef.current.srcObject = e.streams[0];
          videoRef.current.play().catch(() => {});
          setHasVideo(true);
        }
      };

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { to: from, answer });
    });

    socketRef.current.on('ice-candidate', async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) { console.log('ICE error:', e); }
    });

    return () => {
      pcRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [roomId, user?._id]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit('chat-message', { roomId, message: chatInput, userName: user?.name });
    setChatInput('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', color: 'white' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 28px', background: 'rgba(7,5,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          ← Leave
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2020', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>LIVE — {sessionTitle}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>👥 {viewers} watching</div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        {/* Video */}
        <div style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {!hasVideo && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 64 }}>🎙️</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Waiting for tutor's video stream...</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Make sure the tutor has started their camera</p>
            </div>
          )}
        </div>

        {/* Chat */}
        <div style={{ background: 'rgba(7,5,15,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>💬 Live Chat</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 40 }}>Be the first to say hi! 👋</div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#9d7fd4', marginBottom: 3 }}>{msg.from}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{msg.message}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              placeholder="Say something..."
              style={{ flex: 1, fontSize: 13, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'white', fontFamily: 'inherit', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && sendChat()} />
            <button onClick={sendChat}
              style={{ padding: '10px 16px', background: 'rgba(123,94,167,0.3)', border: '1px solid rgba(123,94,167,0.4)', borderRadius: 12, color: '#9d7fd4', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 700 }}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}