const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

// ─── HELPERS ────────────────────────────────────────────────────────────────

const header = (gradient, emoji, title, subtitle) => `
  <div style="background:${gradient};padding:48px 40px;text-align:center;border-radius:0 0 32px 32px">
    <div style="font-size:52px;margin-bottom:12px">${emoji}</div>
    <h1 style="color:white;font-size:30px;font-weight:900;margin:0 0 8px">${title}</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0">${subtitle}</p>
  </div>`;

const footer = () => `
  <div style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
    <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0">© 2025 InnoVenture · Made with 💜 for learners everywhere</p>
  </div>`;

const button = (url, text, gradient) => `
  <div style="text-align:center;margin-top:32px">
    <a href="${url}" style="display:inline-block;padding:16px 40px;background:${gradient};border-radius:14px;color:white;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 30px rgba(0,0,0,0.3)">${text}</a>
  </div>`;

const infoBox = (color, emoji, title, desc) => `
  <div style="background:rgba(${color},0.08);border:1px solid rgba(${color},0.25);border-radius:16px;padding:20px 24px;margin:20px 0;display:flex;align-items:center;gap:16px">
    <span style="font-size:28px">${emoji}</span>
    <div><div style="color:white;font-weight:700;font-size:15px;margin-bottom:3px">${title}</div><div style="color:rgba(255,255,255,0.4);font-size:13px">${desc}</div></div>
  </div>`;

const reasonBox = (reason) => `
  <div style="background:rgba(252,129,129,0.06);border:1px solid rgba(252,129,129,0.2);border-radius:14px;padding:20px 24px;margin:20px 0">
    <div style="color:#fc8181;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px">REASON</div>
    <div style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6">${reason}</div>
  </div>`;

const wrap = (content) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080714;font-family:'DM Sans',Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#080714">${content}</div></body></html>`;

const send = (to, subject, html) => transporter.sendMail({
  from: `"InnoVenture" <${process.env.GMAIL_USER}>`, to, subject, html
});

// ─── WELCOME EMAILS ─────────────────────────────────────────────────────────

const sendWelcomeEmail = async (email, name, role = 'learner') => {
  const isTutor = role === 'tutor';
  const html = wrap(`
    ${header(
      isTutor ? 'linear-gradient(135deg,#f6ad55,#ff6b9d)' : 'linear-gradient(135deg,#7c6cff,#ff6b9d)',
      isTutor ? '👨‍🏫' : '🚀',
      isTutor ? 'Welcome, Tutor!' : 'Welcome to InnoVenture!',
      isTutor ? 'Your teaching journey begins now' : 'Your learning adventure starts right now'
    )}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong> 👋</p>
      ${isTutor
        ? `<p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">You have applied to be a tutor on InnoVenture! Your account is currently <strong style="color:#f6ad55">pending admin approval</strong>. Once approved, you can create courses and go live.</p>
           ${infoBox('246,173,85', '⏳', 'Pending Approval', 'Admin will review your application shortly')}
           ${infoBox('124,108,255', '📚', 'Create your first course', 'Design engaging lessons with videos and quizzes')}
           ${infoBox('0,245,196', '💰', 'Earn from your expertise', 'Keep 80% of every enrollment fee')}
           ${button(process.env.FRONTEND_URL + '/tutor', 'Go to Tutor Dashboard →', 'linear-gradient(135deg,#f6ad55,#ff6b9d)')}`
        : `<p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">You have just joined InnoVenture — earn XP, unlock badges, and master new skills every day.</p>
           <div style="background:rgba(124,108,255,0.1);border:1px solid rgba(124,108,255,0.3);border-radius:20px;padding:28px;margin:24px 0;text-align:center">
             <div style="font-size:36px;margin-bottom:8px">⭐</div>
             <div style="color:#a89cff;font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:4px">WELCOME BONUS</div>
             <div style="color:white;font-size:28px;font-weight:900">+50 XP</div>
             <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:4px">Added to your account</div>
           </div>
           ${infoBox('255,215,0', '🎯', 'Complete your first lesson', 'Earn XP and unlock your first badge')}
           ${infoBox('124,108,255', '🏆', 'Climb the leaderboard', 'Compete with learners worldwide')}
           ${infoBox('0,245,196', '🧠', 'Ask Sage AI', 'Your personal AI learning assistant')}
           ${button(process.env.FRONTEND_URL + '/dashboard', 'Start Learning →', 'linear-gradient(135deg,#7c6cff,#9b8cff)')}`
      }
    </div>
    ${footer()}`);
  await send(email, isTutor ? '👨‍🏫 Welcome Tutor! Your application is under review' : '🚀 Welcome to InnoVenture! Your journey begins now', html);
};

// ─── TUTOR STATUS EMAILS ─────────────────────────────────────────────────────

const sendTutorApprovedEmail = async (email, name) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#43d9ad,#7c6cff)', '🎉', 'You\'re Approved!', 'Welcome to the InnoVenture tutor family')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong> 👋</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">Great news! Your tutor application has been <strong style="color:#43d9ad">approved by our admin team</strong>. You can now create courses, upload lessons, and go live with students!</p>
      ${infoBox('67,217,173', '✅', 'Account Activated', 'You are now a verified InnoVenture tutor')}
      ${infoBox('124,108,255', '📚', 'Create Your First Course', 'Head to your dashboard and start building')}
      ${infoBox('0,245,196', '💰', '80% Revenue Share', 'You keep 80% of every enrollment fee')}
      ${infoBox('255,107,157', '🔴', 'Go Live', 'Schedule live sessions with your students')}
      ${button(process.env.FRONTEND_URL + '/tutor', 'Go to Tutor Dashboard →', 'linear-gradient(135deg,#43d9ad,#7c6cff)')}
    </div>
    ${footer()}`);
  await send(email, '🎉 Congratulations! Your tutor application is approved', html);
};

const sendTutorRejectedEmail = async (email, name, reason) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#2d1f4e,#1a1830)', '😔', 'Application Not Approved', 'Thank you for your interest in teaching')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong>,</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">After reviewing your tutor application, our admin team was unable to approve it at this time.</p>
      ${reasonBox(reason)}
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7">You are welcome to re-apply in 30 days after addressing the feedback above. In the meantime, you can continue using InnoVenture as a learner.</p>
      ${infoBox('124,108,255', '💡', 'Want to reapply?', 'Address the feedback above and submit a new application')}
      ${button(process.env.FRONTEND_URL + '/dashboard', 'Continue as Learner →', 'linear-gradient(135deg,#7c6cff,#9b8cff)')}
    </div>
    ${footer()}`);
  await send(email, '📋 Update on your InnoVenture tutor application', html);
};

// ─── COURSE STATUS EMAILS ─────────────────────────────────────────────────────

const sendCourseApprovedEmail = async (email, name, courseTitle) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#00f5c4,#7c6cff)', '🚀', 'Course Approved!', 'Your course is now live on InnoVenture')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong> 👋</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">Your course has been reviewed and <strong style="color:#00f5c4">approved</strong>! It is now live and visible to learners on InnoVenture.</p>
      <div style="background:rgba(0,245,196,0.06);border:1px solid rgba(0,245,196,0.2);border-radius:16px;padding:20px 24px;margin:20px 0;text-align:center">
        <div style="color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:6px">COURSE NOW LIVE</div>
        <div style="color:#00f5c4;font-size:18px;font-weight:900">${courseTitle}</div>
      </div>
      ${infoBox('246,173,85', '📊', 'Track Enrollments', 'Monitor how many learners join your course')}
      ${infoBox('124,108,255', '💰', 'Start Earning', 'You earn 80% of every enrollment')}
      ${button(process.env.FRONTEND_URL + '/tutor', 'View Your Dashboard →', 'linear-gradient(135deg,#00f5c4,#7c6cff)')}
    </div>
    ${footer()}`);
  await send(email, `🚀 Your course "${courseTitle}" is now live!`, html);
};

const sendCourseRejectedEmail = async (email, name, courseTitle, reason) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#2d1f4e,#1a1830)', '📋', 'Course Needs Changes', 'Your course requires some updates')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong>,</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">Our admin team reviewed your course and needs some changes before it can go live.</p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 24px;margin:20px 0;text-align:center">
        <div style="color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:6px">COURSE UNDER REVIEW</div>
        <div style="color:white;font-size:18px;font-weight:900">${courseTitle}</div>
      </div>
      ${reasonBox(reason)}
      ${infoBox('246,173,85', '✏️', 'Make the Changes', 'Edit your course and resubmit for review')}
      ${button(process.env.FRONTEND_URL + '/tutor', 'Edit Your Course →', 'linear-gradient(135deg,#f6ad55,#ff6b9d)')}
    </div>
    ${footer()}`);
  await send(email, `📋 Your course "${courseTitle}" needs some changes`, html);
};

// ─── ENROLLMENT EMAILS ────────────────────────────────────────────────────────

const sendEnrollmentEmail = async (email, name, courseTitle, tutorName) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#00f5c4,#7c6cff)', '🎉', "You're Enrolled!", 'Get ready to level up your skills')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong> 🎓</p>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.7">You have successfully enrolled in:</p>
      <div style="background:rgba(0,245,196,0.06);border:1px solid rgba(0,245,196,0.2);border-radius:20px;padding:24px;margin:20px 0;text-align:center">
        <div style="color:#00f5c4;font-size:20px;font-weight:900;margin-bottom:6px">${courseTitle}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:13px">by ${tutorName || 'InnoVenture Tutor'}</div>
      </div>
      ${infoBox('255,215,0', '⭐', '+50 XP Earned', 'XP has been added to your account')}
      ${infoBox('124,108,255', '🎯', 'Complete lessons', 'Earn more XP with every lesson you finish')}
      ${button(process.env.FRONTEND_URL + '/courses', 'Start Learning →', 'linear-gradient(135deg,#00f5c4,#7c6cff)')}
    </div>
    ${footer()}`);
  await send(email, `🎉 You're enrolled in "${courseTitle}"!`, html);
};

const sendNewEnrollmentToTutorEmail = async (email, tutorName, learnerName, courseTitle, totalEnrollments) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#7c6cff,#ff6b9d)', '🎓', 'New Student Enrolled!', 'Your course just got a new learner')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${tutorName}</strong> 👋</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7"><strong style="color:white">${learnerName}</strong> just enrolled in your course!</p>
      <div style="background:rgba(124,108,255,0.06);border:1px solid rgba(124,108,255,0.2);border-radius:16px;padding:20px 24px;margin:20px 0;text-align:center">
        <div style="color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:6px">COURSE</div>
        <div style="color:#a89cff;font-size:18px;font-weight:900;margin-bottom:8px">${courseTitle}</div>
        <div style="color:#00f5c4;font-size:24px;font-weight:900">${totalEnrollments} students</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px">total enrolled</div>
      </div>
      ${button(process.env.FRONTEND_URL + '/tutor', 'View Dashboard →', 'linear-gradient(135deg,#7c6cff,#ff6b9d)')}
    </div>
    ${footer()}`);
  await send(email, `🎓 New student enrolled in "${courseTitle}"!`, html);
};

// ─── LIVE SESSION EMAILS ──────────────────────────────────────────────────────

const sendLiveSessionEmail = async (email, name, tutorName, sessionTitle, sessionTime, roomId) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#ff6b9d,#7c6cff)', '🔴', 'Live Session Starting!', 'Your tutor is going live soon')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong> 👋</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7"><strong style="color:white">${tutorName}</strong> is starting a live session!</p>
      <div style="background:rgba(255,107,157,0.06);border:1px solid rgba(255,107,157,0.2);border-radius:16px;padding:24px;margin:20px 0">
        <div style="color:white;font-size:18px;font-weight:900;margin-bottom:8px">${sessionTitle}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:4px">👨‍🏫 ${tutorName}</div>
        <div style="color:#ff6b9d;font-size:13px;font-weight:700">🕐 ${sessionTime}</div>
      </div>
      ${infoBox('255,107,157', '💬', 'Live Chat', 'Ask questions in real-time during the session')}
      ${button(process.env.FRONTEND_URL + '/live/' + roomId, 'Join Live Session →', 'linear-gradient(135deg,#ff6b9d,#7c6cff)')}
    </div>
    ${footer()}`);
  await send(email, `🔴 ${tutorName} is going LIVE: ${sessionTitle}`, html);
};

// ─── ACCOUNT WARNINGS ─────────────────────────────────────────────────────────

const sendAccountWarnedEmail = async (email, name, reason) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#f6ad55,#fc8181)', '⚠️', 'Account Warning', 'Important notice about your account')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong>,</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">Your InnoVenture account has received a <strong style="color:#f6ad55">formal warning</strong> from our admin team.</p>
      ${reasonBox(reason)}
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7">⚠️ Please note: repeated violations may result in account suspension. We encourage you to review our <strong style="color:white">community guidelines</strong>.</p>
      ${button(process.env.FRONTEND_URL + '/dashboard', 'Review Guidelines →', 'linear-gradient(135deg,#f6ad55,#fc8181)')}
    </div>
    ${footer()}`);
  await send(email, '⚠️ Important: Warning issued on your InnoVenture account', html);
};

const sendAccountSuspendedEmail = async (email, name, reason) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#fc8181,#c53030)', '🚫', 'Account Suspended', 'Your account has been suspended')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong>,</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">Your InnoVenture account has been <strong style="color:#fc8181">suspended</strong> by our admin team due to violations of our platform guidelines.</p>
      ${reasonBox(reason)}
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7">If you believe this is a mistake, please contact our support team by replying to this email.</p>
    </div>
    ${footer()}`);
  await send(email, '🚫 Your InnoVenture account has been suspended', html);
};

// ─── ADMIN NOTIFICATION EMAILS ────────────────────────────────────────────────

const sendAdminNewTutorApplicationEmail = async (adminEmail, tutorName, tutorEmail) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#7c6cff,#00f5c4)', '📋', 'New Tutor Application', 'A new tutor has applied to teach')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">New tutor application received!</p>
      ${infoBox('124,108,255', '👨‍🏫', tutorName, tutorEmail)}
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7">Please review their application and approve or reject from the admin dashboard.</p>
      ${button(process.env.FRONTEND_URL + '/admin', 'Review Application →', 'linear-gradient(135deg,#7c6cff,#00f5c4)')}
    </div>
    ${footer()}`);
  await send(adminEmail, `📋 New tutor application from ${tutorName}`, html);
};

const sendAdminNewCourseEmail = async (adminEmail, tutorName, courseTitle) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#f6ad55,#7c6cff)', '📚', 'New Course Pending Review', 'A tutor has submitted a course for approval')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">A new course is waiting for your review!</p>
      ${infoBox('246,173,85', '📚', courseTitle, `Submitted by ${tutorName}`)}
      ${button(process.env.FRONTEND_URL + '/admin', 'Review Course →', 'linear-gradient(135deg,#f6ad55,#7c6cff)')}
    </div>
    ${footer()}`);
  await send(adminEmail, `📚 New course pending review: "${courseTitle}"`, html);
};

// ─── PASSWORD RESET ───────────────────────────────────────────────────────────

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#1a1830,#2d1f4e)', '🔐', 'Reset Your Password', 'You requested a password reset')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong>,</p>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.7">Click the button below to reset your password. This link expires in <strong style="color:white">1 hour</strong>.</p>
      ${button(resetUrl, 'Reset Password →', 'linear-gradient(135deg,#7c6cff,#9b8cff)')}
      <div style="background:rgba(252,129,129,0.06);border:1px solid rgba(252,129,129,0.15);border-radius:14px;padding:16px;text-align:center;margin-top:24px">
        <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0">⚠️ If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
    ${footer()}`);
  await send(email, '🔐 Reset your InnoVenture password', html);
};

// ─── CERTIFICATE EMAIL ────────────────────────────────────────────────────────

const sendCertificateEmail = async (email, name, courseTitle) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#ffd700,#f6ad55)', '🏆', 'Course Completed!', 'You earned a certificate')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Congratulations <strong style="color:white">${name}</strong>! 🎉</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">You have successfully completed the course and earned your certificate!</p>
      <div style="background:rgba(255,215,0,0.06);border:2px solid rgba(255,215,0,0.3);border-radius:20px;padding:28px;margin:24px 0;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">🏆</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:6px">CERTIFICATE OF COMPLETION</div>
        <div style="color:#ffd700;font-size:20px;font-weight:900">${courseTitle}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:8px">Awarded to ${name}</div>
      </div>
      ${infoBox('255,215,0', '⭐', '+100 XP Earned', 'Course completion bonus added to your account')}
      ${button(process.env.FRONTEND_URL + '/dashboard', 'View Your Certificate →', 'linear-gradient(135deg,#ffd700,#f6ad55)')}
    </div>
    ${footer()}`);
  await send(email, `🏆 You completed "${courseTitle}" — Certificate Ready!`, html);
};

// ─── WEEKLY PROGRESS EMAIL ────────────────────────────────────────────────────

const sendWeeklyProgressEmail = async (email, name, xpEarned, coursesProgress, rank) => {
  const html = wrap(`
    ${header('linear-gradient(135deg,#7c6cff,#00f5c4)', '📊', 'Your Weekly Progress', 'Here is how you did this week')}
    <div style="padding:40px">
      <p style="color:rgba(255,255,255,0.8);font-size:16px">Hey <strong style="color:white">${name}</strong> 👋</p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7">Here is your learning summary for this week:</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0">
        <div style="background:rgba(124,108,255,0.08);border:1px solid rgba(124,108,255,0.2);border-radius:16px;padding:20px;text-align:center">
          <div style="font-size:28px;margin-bottom:6px">⭐</div>
          <div style="color:#a89cff;font-size:24px;font-weight:900">+${xpEarned}</div>
          <div style="color:rgba(255,255,255,0.4);font-size:12px">XP Earned</div>
        </div>
        <div style="background:rgba(0,245,196,0.08);border:1px solid rgba(0,245,196,0.2);border-radius:16px;padding:20px;text-align:center">
          <div style="font-size:28px;margin-bottom:6px">🏆</div>
          <div style="color:#00f5c4;font-size:24px;font-weight:900">#${rank}</div>
          <div style="color:rgba(255,255,255,0.4);font-size:12px">Leaderboard Rank</div>
        </div>
      </div>
      ${infoBox('124,108,255', '📚', 'Keep Going!', `You have ${coursesProgress} lessons in progress`)}
      ${button(process.env.FRONTEND_URL + '/dashboard', 'Continue Learning →', 'linear-gradient(135deg,#7c6cff,#00f5c4)')}
    </div>
    ${footer()}`);
  await send(email, `📊 Your weekly InnoVenture progress — +${xpEarned} XP earned!`, html);
};

module.exports = {
  sendWelcomeEmail,
  sendTutorApprovedEmail,
  sendTutorRejectedEmail,
  sendCourseApprovedEmail,
  sendCourseRejectedEmail,
  sendEnrollmentEmail,
  sendNewEnrollmentToTutorEmail,
  sendLiveSessionEmail,
  sendAccountWarnedEmail,
  sendAccountSuspendedEmail,
  sendAdminNewTutorApplicationEmail,
  sendAdminNewCourseEmail,
  sendPasswordResetEmail,
  sendCertificateEmail,
  sendWeeklyProgressEmail
};