import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    dob: user?.dob || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const saveProfile = async () => {
    setSaving(true);
    try {
      await API.put('/users/profile', form);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!passwords.current) return toast.error('Enter your current password');
    if (passwords.newPass.length < 8) return toast.error('New password must be 8+ characters');
    if (!/[A-Z]/.test(passwords.newPass)) return toast.error('Need an uppercase letter');
    if (!/[0-9]/.test(passwords.newPass)) return toast.error('Need a number');
    if (!/[^A-Za-z0-9]/.test(passwords.newPass)) return toast.error('Need a special character');
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await API.put('/users/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully! 🔐');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== user?.email) return toast.error('Type your email exactly to confirm');
    try {
      await API.delete('/users/account');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const TABS = [
    { id: 'profile', icon: '👤', label: 'My Profile' },
    { id: 'password', icon: '🔐', label: 'Change Password' },
    { id: 'danger', icon: '⚠️', label: 'Danger Zone' },
  ];

  const backPath = user?.role === 'admin' ? '/admin' : user?.role === 'tutor' ? '/tutor' : '/dashboard';

  return (
    <div style={{ minHeight: '100vh', background: '#07060f', color: 'white', fontFamily: 'inherit' }}>

      {/* Top nav */}
      <div style={{ padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(backPath)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>← Back</button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
          <span style={{ color: 'white' }}>Inno</span>
          <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Account Settings</div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>

        {/* Left sidebar */}
        <div>
          {/* Avatar */}
          <div style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: 'white', margin: '0 auto 16px' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{user?.email}</div>
            <span style={{ padding: '3px 12px', background: user?.role === 'admin' ? 'rgba(252,129,129,0.15)' : user?.role === 'tutor' ? 'rgba(123,94,167,0.15)' : 'rgba(67,217,173,0.15)', color: user?.role === 'admin' ? '#fc8181' : user?.role === 'tutor' ? '#9d7fd4' : '#43d9ad', border: `1px solid ${user?.role === 'admin' ? 'rgba(252,129,129,0.3)' : user?.role === 'tutor' ? 'rgba(123,94,167,0.3)' : 'rgba(67,217,173,0.3)'}`, borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
              {user?.role}
            </span>
            {user?.role === 'learner' && (
              <div style={{ marginTop: 14, padding: '10px', background: 'rgba(123,94,167,0.08)', borderRadius: 12, border: '1px solid rgba(123,94,167,0.15)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#ffd700' }}>⭐ {user?.xp || 0} XP</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Level {user?.level || 1}</div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, border: `1px solid ${tab === t.id ? (t.id === 'danger' ? 'rgba(252,129,129,0.3)' : 'rgba(123,94,167,0.3)') : 'transparent'}`, background: tab === t.id ? (t.id === 'danger' ? 'rgba(252,129,129,0.08)' : 'rgba(123,94,167,0.12)') : 'transparent', color: tab === t.id ? (t.id === 'danger' ? '#fc8181' : '#9d7fd4') : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div style={{ background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '32px' }}>

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>My Profile</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Update your personal information</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>FULL NAME</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>EMAIL ADDRESS</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" type="email" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>DATE OF BIRTH</label>
                    <input value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} type="date" style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>PHONE NUMBER</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" type="tel" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>BIO</label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={4} style={{ resize: 'vertical' }} />
                </div>

                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 10, letterSpacing: '0.06em' }}>ACCOUNT INFO</div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Role: <strong style={{ color: 'white' }}>{user?.role}</strong></div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Member since: <strong style={{ color: 'white' }}>2026</strong></div>
                    {user?.role === 'learner' && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Level: <strong style={{ color: '#ffd700' }}>{user?.level || 1}</strong></div>}
                  </div>
                </div>

                <button onClick={saveProfile} disabled={saving} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1, alignSelf: 'flex-start' }}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {tab === 'password' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Change Password</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Keep your account secure with a strong password</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>CURRENT PASSWORD</label>
                  <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder="Your current password" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>NEW PASSWORD</label>
                  <input type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Min 8 chars, uppercase, number, special" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.06em' }}>CONFIRM NEW PASSWORD</label>
                  <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" />
                </div>

                {passwords.newPass && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { check: passwords.newPass.length >= 8, label: '8+ characters' },
                      { check: /[A-Z]/.test(passwords.newPass), label: 'Uppercase' },
                      { check: /[0-9]/.test(passwords.newPass), label: 'Number' },
                      { check: /[^A-Za-z0-9]/.test(passwords.newPass), label: 'Special char' },
                      { check: passwords.newPass === passwords.confirm && passwords.confirm.length > 0, label: 'Passwords match' },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: r.check ? '#43d9ad' : 'rgba(255,255,255,0.3)', fontWeight: r.check ? 600 : 400 }}>
                        <span>{r.check ? '✓' : '○'}</span> {r.label}
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={changePassword} disabled={saving} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Updating...' : '🔐 Update Password'}
                </button>
              </div>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {tab === 'danger' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#fc8181' }}>⚠️ Danger Zone</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>These actions are permanent and cannot be undone</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Disable account */}
                <div style={{ padding: 24, background: 'rgba(246,173,85,0.05)', border: '1px solid rgba(246,173,85,0.2)', borderRadius: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f6ad55', marginBottom: 8 }}>Disable Account</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.6 }}>Temporarily disable your account. You can reactivate it anytime by contacting support.</p>
                  <button onClick={() => toast('Contact support@innoventure.com to disable your account', { icon: 'ℹ️' })} style={{ padding: '10px 24px', background: 'rgba(246,173,85,0.1)', border: '1px solid rgba(246,173,85,0.3)', borderRadius: 10, color: '#f6ad55', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
                    Disable Account
                  </button>
                </div>

                {/* Delete account */}
                <div style={{ padding: 24, background: 'rgba(252,129,129,0.05)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fc8181', marginBottom: 8 }}>Delete Account</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.6 }}>Permanently delete your account and all your data. This cannot be undone. All your XP, badges, and progress will be lost forever.</p>

                  {!showDelete ? (
                    <button onClick={() => setShowDelete(true)} style={{ padding: '10px 24px', background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', borderRadius: 10, color: '#fc8181', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
                      Delete My Account
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p style={{ fontSize: 13, color: '#fc8181', fontWeight: 600 }}>Type your email <strong>{user?.email}</strong> to confirm:</p>
                      <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={user?.email} style={{ borderColor: 'rgba(252,129,129,0.4)' }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={deleteAccount} disabled={deleteConfirm !== user?.email} style={{ padding: '10px 24px', background: deleteConfirm === user?.email ? 'linear-gradient(135deg,#fc8181,#e53e3e)' : 'rgba(252,129,129,0.1)', border: 'none', borderRadius: 10, color: 'white', cursor: deleteConfirm === user?.email ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>
                          Permanently Delete
                        </button>
                        <button onClick={() => { setShowDelete(false); setDeleteConfirm(''); }} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}