import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free', price: 0, period: 'forever', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)',
    badge: null, buttonLabel: 'Current Plan', buttonStyle: 'muted',
    features: ['Access to free courses only', 'Basic leaderboard', 'Earn XP & badges', 'AI chatbot (10 msgs/day)', 'Community access', '❌ Live sessions', '❌ Certificates', '❌ Premium courses'],
  },
  {
    name: 'Pro Monthly', price: 299, period: 'per month', color: 'var(--violet-bright)', border: 'rgba(123,94,167,0.5)',
    badge: '🔥 Most Popular', buttonLabel: 'Start Monthly Plan', buttonStyle: 'violet',
    features: ['✅ All free courses', '✅ All premium courses', '✅ Unlimited live sessions', '✅ Download certificates', '✅ Unlimited AI chatbot', '✅ Priority support', '✅ Exclusive badges', 'Cancel anytime'],
  },
  {
    name: 'Pro Yearly', price: 1999, period: 'per year', color: 'var(--gold)', border: 'rgba(240,192,64,0.4)',
    badge: '💰 Save 44%', buttonLabel: 'Start Yearly Plan', buttonStyle: 'gold',
    features: ['✅ Everything in Monthly', '✅ 2 months free', '✅ Early access to new courses', '✅ 1-on-1 tutor session/month', '✅ Resume review by tutors', '✅ Exclusive yearly badge', '✅ Offline video downloads', 'Best value for students'],
  },
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription anytime from Account Settings. No questions asked. Your access continues until the end of your billing period.' },
  { q: 'What happens to my progress if I cancel?', a: 'Your XP, badges, and progress in free courses are saved forever. You lose access to premium courses but your data stays safe.' },
  { q: 'Is there a refund policy?', a: 'Yes — we offer a 7-day full refund if you\'re not satisfied. Contact support within 7 days of payment.' },
  { q: 'Can I switch plans?', a: 'Absolutely! Upgrade from Monthly to Yearly anytime. We\'ll prorate the difference automatically.' },
  { q: 'Do tutors get paid from subscriptions?', a: 'Yes! 80% of subscription revenue is distributed to tutors based on how many minutes students watched their content.' },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [billingYearly, setBillingYearly] = useState(false);

  const handleChoosePlan = (plan) => {
    if (plan.price === 0) return toast('You are already on the free plan!', { icon: '😊' });
    toast('Redirecting to payment...', { icon: '💳' });
    setTimeout(() => navigate('/payment?plan=' + plan.name.replace(' ', '-').toLowerCase()), 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', paddingBottom: 80 }}>
      {/* Nav */}
      <div style={{ padding: '16px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(user?.role === 'tutor' ? '/tutor' : '/dashboard')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>← Dashboard</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InnoVenture</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 0' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(123,94,167,0.12)', border: '1px solid rgba(123,94,167,0.25)', borderRadius: 99, fontSize: 13, fontWeight: 600, color: 'var(--violet-bright)', marginBottom: 20 }}>
            🚀 Simple, transparent pricing
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
            Choose your<br />
            <span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>learning plan</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 500, margin: '0 auto 32px' }}>Start free. Upgrade when you're ready. Cancel anytime.</p>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99, padding: 4, gap: 2 }}>
            {['Monthly', 'Yearly'].map(b => (
              <button key={b} onClick={() => setBillingYearly(b === 'Yearly')} style={{ padding: '8px 24px', background: (b === 'Yearly') === billingYearly ? 'linear-gradient(135deg,#7b5ea7,#e8547a)' : 'transparent', border: 'none', borderRadius: 99, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
                {b} {b === 'Yearly' && <span style={{ fontSize: 11, background: 'rgba(240,192,64,0.2)', padding: '2px 6px', borderRadius: 99, color: 'var(--gold)' }}>SAVE 44%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 64 }}>
          {plans.map((plan, i) => {
            const displayPrice = plan.price === 0 ? 0 : billingYearly && plan.name === 'Pro Monthly' ? 199 : plan.price;
            const isPopular = plan.name === 'Pro Monthly';
            return (
              <div key={i} style={{ background: isPopular ? 'linear-gradient(145deg, rgba(123,94,167,0.12), rgba(14,11,26,0.8))' : 'rgba(14,11,26,0.7)', border: `1.5px solid ${plan.border}`, borderRadius: 24, padding: '32px 28px', position: 'relative', transition: 'all 0.25s', transform: isPopular ? 'scale(1.03)' : 'scale(1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = isPopular ? 'scale(1.05) translateY(-4px)' : 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = isPopular ? 'scale(1.03)' : 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 18px', background: isPopular ? 'linear-gradient(135deg,#7b5ea7,#e8547a)' : 'linear-gradient(135deg,#f0c040,#e8a020)', borderRadius: 99, fontSize: 12, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(123,94,167,0.4)' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: plan.price === 0 ? 40 : 44, fontWeight: 700, color: plan.color, lineHeight: 1 }}>
                      {plan.price === 0 ? 'Free' : `₹${displayPrice}`}
                    </span>
                    {plan.price > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 14, paddingBottom: 6 }}>/{billingYearly && plan.name === 'Pro Monthly' ? 'mo billed yearly' : plan.period}</span>}
                  </div>
                  {billingYearly && plan.name === 'Pro Monthly' && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>You save ₹1,200/year!</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: f.startsWith('❌') ? 'var(--text-dim)' : 'var(--text-muted)' }}>
                      {!f.startsWith('✅') && !f.startsWith('❌') && <span style={{ color: 'var(--text-dim)', flexShrink: 0, marginTop: 1 }}>•</span>}
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleChoosePlan(plan)} style={{
                  width: '100%', padding: '13px',
                  background: plan.buttonStyle === 'violet' ? 'linear-gradient(135deg,#7b5ea7,#e8547a)' : plan.buttonStyle === 'gold' ? 'linear-gradient(135deg,#f0c040,#e8a020)' : 'rgba(255,255,255,0.06)',
                  border: plan.buttonStyle === 'muted' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  borderRadius: 14, color: plan.buttonStyle === 'gold' ? '#2a1f00' : 'white',
                  cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-body)',
                  boxShadow: plan.buttonStyle !== 'muted' ? '0 4px 20px rgba(123,94,167,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {plan.buttonLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 64 }}>
          {['🔒 256-bit SSL secured', '↩️ 7-day refund policy', '❌ No hidden charges', '📱 Access on all devices', '🇮🇳 Made for India'].map((b, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{b}</div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 700, margin: '0 auto', marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Frequently Asked Questions</h2>
          {FAQ.map((item, i) => (
            <div key={i} style={{ marginBottom: 12, background: 'rgba(14,11,26,0.6)', border: `1px solid ${openFaq === i ? 'rgba(123,94,167,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
                <span>{item.q}</span>
                <span style={{ color: 'var(--violet-bright)', fontSize: 20, transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 12 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 18px', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, animation: 'slide-up 0.2s ease' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(135deg, rgba(123,94,167,0.1), rgba(232,84,122,0.08))', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 28, marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Still not sure? Start free.</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>No credit card needed. Upgrade when you find a course you love.</p>
          <button onClick={() => navigate('/courses')} style={{ padding: '14px 40px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-body)', boxShadow: '0 4px 24px rgba(123,94,167,0.4)' }}>
            Browse Free Courses →
          </button>
        </div>
      </div>
    </div>
  );
}
