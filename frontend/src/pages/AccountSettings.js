import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setLoading(true);
    try {
      await API.put('/users/profile', { name: name.trim() });
      const stored = JSON.parse(localStorage.getItem('innoventure_user') || '{}');
      localStorage.setItem('innoventure_user', JSON.stringify({ ...stored, name: name.trim() }));
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPass.length < 8) return toast.error('Password must be 8+ characters');
    setLoading(true);
    try {
      await API.put('/users/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed! ✅');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed — check your current password');
    }
    setLoading(false);
  };

  const dashPath = user?.role === 'admin' ? '/admin' : user?.role === 'tutor' ? '/tutor' : '/dashboard';

  const navItems = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'password', icon: '🔐', label: 'Password' },
    { id: 'danger', icon: '⚠️', label: 'Danger Zone' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column' }}>
      {/* TOP NAV BAR */}
      <div style={{ height: 60, background: 'rgba(7,5,15,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, flexShrink: 0, backdropFilter: 'blur(20px)', zIndex: 100 }}>
        <button onClick={() => navigate(dashPath)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
          ← Dashboard
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
          <span style={{ color: 'white' }}>Inno</span>
          <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{user?.name}</span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1000, width: '100%', margin: '0 auto', padding: '40px 24px', gap: 32, boxSizing: 'border-box' }}>

        {/* LEFT SIDEBAR */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 24 }}>⚙️ Settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: tab === item.id ? 'rgba(123,94,167,0.2)' : 'transparent', border: `1px solid ${tab === item.id ? 'rgba(123,94,167,0.4)' : 'transparent'}`, borderRadius: 12, color: tab === item.id ? 'var(--violet-bright)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                onMouseEnter={e => { if (tab !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}}
                onMouseLeave={e => { if (tab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* User card in sidebar */}
          <div style={{ marginTop: 32, padding: '16px', background: 'rgba(123,94,167,0.08)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '8px', background: 'rgba(240,192,64,0.08)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{user?.xp || 0}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>XP</div>
              </div>
              <div style={{ flex: 1, padding: '8px', background: 'rgba(123,94,167,0.08)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--violet-bright)', fontFamily: 'var(--font-display)' }}>{user?.level || 1}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Level</div>
              </div>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', marginTop: 12, padding: '11px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 12, color: '#ff6060', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🚪 Logout
          </button>
        </div>

        {/* RIGHT CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Your Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Update your display name and view account info</p>
              </div>

              {/* Profile header card */}
              <div style={{ padding: '24px', background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>{user?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</div>
                  <span style={{ padding: '3px 12px', background: 'rgba(123,94,167,0.15)', color: 'var(--violet-bright)', border: '1px solid rgba(123,94,167,0.25)', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
              </div>

              {/* Edit form */}
              <div style={{ padding: '28px', background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 }}>
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Display Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required style={{ fontSize: 15, padding: '13px 16px' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Email Address (read-only)</label>
                    <input value={user?.email || ''} readOnly style={{ fontSize: 14, padding: '13px 16px', opacity: 0.4, cursor: 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ padding: '16px', background: 'rgba(240,192,64,0.07)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>XP Points</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--gold)' }}>{user?.xp || 0}</div>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(123,94,167,0.07)', border: '1px solid rgba(123,94,167,0.15)', borderRadius: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Level</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--violet-bright)' }}>{user?.level || 1}</div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'rgba(123,94,167,0.3)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: loading ? 'none' : '0 4px 20px rgba(123,94,167,0.3)', transition: 'all 0.2s' }}>
                    {loading ? '⏳ Saving...' : '✅ Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {tab === 'password' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Change Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Keep your account secure with a strong password</p>
              </div>
              <div style={{ padding: '28px', background: 'rgba(14,11,26,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 }}>
                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { label: 'Current Password', key: 'current', ph: '••••••••' },
                    { label: 'New Password', key: 'newPass', ph: 'Min 8 characters' },
                    { label: 'Confirm New Password', key: 'confirm', ph: 'Repeat new password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{f.label}</label>
                      <input type="password" value={passwords[f.key]} onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })} placeholder={f.ph} required style={{ fontSize: 14, padding: '13px 16px' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--violet-bright)'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  ))}
                  <div style={{ padding: '12px 16px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    💡 Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </div>
                  <button type="submit" disabled={loading} style={{ padding: '14px', background: loading ? 'rgba(123,94,167,0.3)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(123,94,167,0.3)' }}>
                    {loading ? '⏳ Updating...' : '🔐 Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {tab === 'danger' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#ff6060', marginBottom: 4 }}>⚠️ Danger Zone</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>These actions cannot be undone. Be very careful.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: '24px', background: 'rgba(255,96,96,0.04)', border: '1px solid rgba(255,96,96,0.15)', borderRadius: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 4 }}>Sign out of all devices</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>This will log you out everywhere. You'll need to sign in again.</div>
                  </div>
                  <button onClick={() => { if (window.confirm('Sign out of all devices?')) { logout(); navigate('/'); toast.success('Signed out!'); }}} style={{ padding: '11px 24px', background: 'rgba(255,96,96,0.12)', border: '1px solid rgba(255,96,96,0.3)', borderRadius: 12, color: '#ff6060', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    🚪 Sign Out Everywhere
                  </button>
                </div>
                <div style={{ padding: '24px', background: 'rgba(255,96,96,0.04)', border: '1px solid rgba(255,96,96,0.15)', borderRadius: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 4 }}>Delete Account</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Permanently delete your account and all your data. This cannot be undone.</div>
                  </div>
                  <button onClick={() => toast.error('Please contact support to delete your account.')} style={{ padding: '11px 24px', background: 'rgba(255,96,96,0.08)', border: '1px solid rgba(255,96,96,0.2)', borderRadius: 12, color: '#ff8080', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    🗑️ Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
