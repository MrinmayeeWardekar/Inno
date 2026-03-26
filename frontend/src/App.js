import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './pages/Profile';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccountSettings from './pages/AccountSettings';

// Learner
import LearnerDashboard from './pages/learner/LearnerDashboard';
import CourseCatalog from './pages/learner/CourseCatalog';
import CourseDetail from './pages/learner/CourseDetail';
import LiveSessions from './pages/learner/LiveSessions';
import LiveRoom from './pages/learner/LiveRoom';
import SageChat from './pages/learner/SageChat';
import QuizPage from './pages/learner/QuizPage';

// Tutor
import TutorDashboard from './pages/tutor/TutorDashboard';
import CreateCourse from './pages/tutor/CreateCourse';
import TutorLive from './pages/tutor/TutorLive';
import TutorQuiz from './pages/tutor/TutorQuiz';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Custom Cursor
const Cursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - 6}px`;
        cursorRef.current.style.top = `${e.clientY - 6}px`;
      }
    };
    const onHover = () => followerRef.current?.classList.add('hovering');
    const onLeave = () => followerRef.current?.classList.remove('hovering');

    let raf;
    const animate = () => {
      followerPos.current.x += (posRef.current.x - followerPos.current.x) * 0.12;
      followerPos.current.y += (posRef.current.y - followerPos.current.y) * 0.12;
      if (followerRef.current) {
        followerRef.current.style.left = `${followerPos.current.x - 18}px`;
        followerRef.current.style.top = `${followerPos.current.y - 18}px`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onHover);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
    </>
  );
};

// Route guards
const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'tutor') return <Navigate to="/tutor" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Learner */}
      <Route path="/dashboard" element={<PrivateRoute roles={['learner']}><LearnerDashboard /></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute><CourseCatalog /></PrivateRoute>} />
      <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
      <Route path="/live" element={<PrivateRoute><LiveSessions /></PrivateRoute>} />
      <Route path="/live/room/:roomId" element={<PrivateRoute><LiveRoom /></PrivateRoute>} />
      <Route path="/sage" element={<PrivateRoute><SageChat /></PrivateRoute>} />
      <Route path="/quiz/:courseId" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><AccountSettings /></PrivateRoute>} />

      {/* Tutor */}
      <Route path="/tutor" element={<PrivateRoute roles={['tutor']}><TutorDashboard /></PrivateRoute>} />
      <Route path="/tutor/create" element={<PrivateRoute roles={['tutor']}><CreateCourse /></PrivateRoute>} />
      <Route path="/tutor/live" element={<PrivateRoute roles={['tutor']}><TutorLive /></PrivateRoute>} />
      <Route path="/tutor/quiz/:courseId" element={<PrivateRoute roles={['tutor']}><TutorQuiz /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Cursor />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(14,11,26,0.95)',
              color: '#f0edf8',
              border: '1px solid rgba(123,94,167,0.3)',
              borderRadius: '14px',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              fontWeight: '600',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              padding: '14px 18px',
            },
            success: { iconTheme: { primary: '#2de08e', secondary: 'transparent' } },
            error: { iconTheme: { primary: '#ff6060', secondary: 'transparent' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
