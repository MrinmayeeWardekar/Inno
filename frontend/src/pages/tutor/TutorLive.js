import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const SOCKET_URL = 'https://innoventure-backend.onrender.com';
const ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
];

export default function TutorLive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [viewers, setViewers] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRefs = useRef({});
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => console.log('Socket connected'));
    socketRef.current.on('connect_error', (e) => console.log('Socket error:', e));

    socketRef.current.on('viewerCount', count => setViewers(count));

    socketRef.current.on('chat-message', ({ message, userName }) => {
      setChatMessages(prev => [...prev.slice(-49), { message, from: userName }]);
    });

    socketRef.current.on('user-joined', async ({ socketId }) => {
      if (!streamRef.current) return;
      const pc = new RTCPeerConnection({ iceServers: ICE });
      peerRefs.current[socketId] = pc;
      streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current));
      pc.onicecandidate = e => {
        if (e.candidate) {
          socketRef.current.emit('ice-candidate', { to: socketId, candidate: e.candidate });
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', { to: socketId, offer });
    });

    socketRef.current.on('answer', async ({ from, answer }) => {
      await peerRefs.current[from]?.setRemoteDescription(answer);
    });

    socketRef.current.on('ice-candidate', async ({ from, candidate }) => {
      await peerRefs.current[from]?.addIceCandidate(candidate);
    });

    return () => {
      socketRef.current?.disconnect();
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startLive = async () => {
    if (!title.trim()) return toast.error('Enter a session title');
    try {
      toast.loading('Accessing camera...', { id: 'cam' });
      
      // Get camera/mic stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      streamRef.current = mediaStream;
      
      // Set video immediately
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      
      setCameraReady(true);
      toast.dismiss('cam');
      toast.success('Camera ready! Starting live session...');

      // Start session on backend
      const { data } = await API.post('/live/start', { title });
      setSessionId(data._id);
      setRoomId(data.roomId);
      setIsLive(true);

      // Join socket room
      socketRef.current.emit('join-room', { 
        roomId: data.roomId, 
        userId: user._id, 
        userName: user.name 
      });

      // Start duration timer
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      toast.success('You are LIVE! 🔴');

    } catch (err) {
      toast.dismiss('cam');
      if (err.name === 'NotAllowedError') {
        toast.error('Camera/mic permission denied! Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        toast.error('No camera found! Please connect a camera and try again.');
      } else {
        toast.error('Failed to start: ' + err.message);
      }
    }
  };

  const endLive = async () => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
      
      if (roomId) {
        socketRef.current.emit('leave-room', { roomId, userName: user.name });
      }
      
      // End session on backend using correct route with session ID
      if (sessionId) {
        await API.put(`/live/${sessionId}/end`).catch(() => {});
      }

      // Close all peer connections
      Object.values(peerRefs.current).forEach(pc => pc.close());
      peerRefs.current = {};

      setIsLive(false);
      setSessionId(null);
      setRoomId(null);
      setCameraReady(false);
      setDuration(0);
      setViewers(0);
      setChatMessages([]);
      streamRef.current = null;
      
      toast.success('Session ended! Great work 👏');
      navigate('/tutor');
    } catch (err) {
      toast.error('Error ending session');
      navigate('/tutor');
    }
  };

  const sendChat = () => {
    if (!chatInput.trim() || !roomId) return;
    socketRef.current.emit('chat-message', { roomId, message: chatInput, userName: user.name });
    setChatInput('');
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', background: '#07060f', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ padding: '16px 32px', background: 'rgba(7,5,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <button onClick={() => isLive ? endLive() : navigate('/tutor')}
          style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          {isLive ? '← End Session' : '← Back'}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>
            {isLive ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff2020', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                LIVE — {title}
              </span>
            ) : '🔴 Start Live Session'}
          </div>
        </div>
        {isLive && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff2020' }}>{viewers}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>viewers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{fmt(duration)}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>duration</div>
            </div>
            <button onClick={endLive}
              style={{ padding: '10px 24px', background: 'rgba(220,30,30,0.2)', border: '1px solid rgba(220,30,30,0.4)', borderRadius: 12, color: '#ff4444', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'inherit' }}>
              End Live
            </button>
          </div>
        )}
      </div>

      {!isLive ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24, display: 'inline-block' }}>🎙️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Ready to go live?</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40, fontSize: 15 }}>Your enrolled students will get an email the moment you start.</p>
            
            <div style={{ background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Session Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Live Q&A — Guitar Chords"
                style={{ width: '100%', marginBottom: 24, fontSize: 16, padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onKeyDown={e => e.key === 'Enter' && startLive()} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  '🎥 Make sure your browser allows camera & microphone access',
                  '📡 All enrolled students will be notified by email',
                  '💬 Live chat available during your session',
                  '🔒 Allow camera when browser asks — click "Allow"'
                ].map((tip, i) => (
                  <div key={i} style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{tip}</div>
                ))}
              </div>

              <button onClick={startLive}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #cc1f1f, #e8547a)', border: 'none', borderRadius: 16, color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 4px 30px rgba(200,30,30,0.4)' }}>
                🔴 Go Live Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
          {/* Video */}
          <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video ref={videoRef} autoPlay muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!cameraReady && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: '#000' }}>
                <div style={{ fontSize: 48 }}>📷</div>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Starting camera...</p>
              </div>
            )}
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,0,0,0.7)', borderRadius: 99 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2020', display: 'inline-block' }} />
              <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>LIVE · {viewers} watching</span>
            </div>
          </div>

          {/* Chat */}
          <div style={{ background: 'rgba(7,5,15,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>💬 Live Chat</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 40 }}>No messages yet — say hi!</div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#9d7fd4', marginBottom: 3 }}>{msg.from}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{msg.message}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Say something..."
                style={{ flex: 1, fontSize: 13, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'white', fontFamily: 'inherit', outline: 'none' }}
                onKeyDown={e => e.key === 'Enter' && sendChat()} />
              <button onClick={sendChat}
                style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#e8547a,#f0c040)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 700 }}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}