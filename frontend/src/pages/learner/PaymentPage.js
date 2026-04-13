import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (courseId) {
      API.get(`/courses/${courseId}`).then(r => setCourse(r.data)).catch(() => {});
    }
  }, [courseId]);

  // Load Razorpay script
  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleRazorpay = async () => {
    if (!courseId) return toast.error('No course selected');
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) return toast.error('Payment gateway failed to load');

      // Create order
      const { data: order } = await API.post('/payment/create-order', { courseId });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'InnoVenture',
        description: order.courseName,
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#7b5ea7' },
        handler: async (response) => {
          try {
            const { data } = await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId
            });
            setSuccess({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id, course: order.courseName, amount: order.amount / 100 });
            toast.success('Payment successful! 🎉');
          } catch { toast.error('Payment verification failed'); }
        }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      // Fallback to demo
      toast('Using demo payment mode...', { icon: '🔧' });
      handleDemo();
    }
    setLoading(false);
  };

  const handleDemo = async () => {
    if (!courseId) return toast.error('No course selected');
    setLoading(true);
    try {
      const { data } = await API.post('/payment/demo-enroll', { courseId });
      setSuccess({ paymentId: data.paymentId, orderId: data.orderId, course: course?.title || 'Course', amount: course?.price || 0 });
      toast.success('Payment demo successful! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'scale-in 0.4s ease' }}>
        <div style={{ fontSize: 80, marginBottom: 20, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'white' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>You are now enrolled in <strong style={{ color: 'white' }}>{success.course}</strong></p>

        {/* Transaction receipt */}
        <div style={{ background: 'rgba(45,224,142,0.06)', border: '1px solid rgba(45,224,142,0.2)', borderRadius: 20, padding: '24px 28px', marginBottom: 28, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>✅ Transaction Receipt</div>
          {[
            ['Course', success.course],
            ['Amount Paid', `₹${success.amount}`],
            ['Payment ID', success.paymentId],
            ['Order ID', success.orderId],
            ['Status', 'SUCCESS'],
            ['Date', new Date().toLocaleString('en-IN')],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-dim)' }}>{label}</span>
              <span style={{ color: label === 'Status' ? 'var(--green)' : label === 'Payment ID' || label === 'Order ID' ? 'var(--font-mono)' : 'white', fontWeight: label === 'Status' ? 800 : 500, fontFamily: label === 'Payment ID' || label === 'Order ID' ? 'var(--font-mono)' : 'var(--font-body)', fontSize: label === 'Payment ID' || label === 'Order ID' ? 11 : 13 }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate(`/courses/${courseId}`)} style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-body)' }}>
            Start Learning →
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '13px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', animation: 'scale-in 0.4s ease' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, marginBottom: 28 }}>← Back</button>

        <div style={{ background: 'rgba(14,11,26,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 36, backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              <span style={{ color: 'white' }}>Inno</span><span style={{ background: 'linear-gradient(135deg,#9d7fd4,#e8547a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Venture</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Secure checkout powered by Razorpay</p>
          </div>

          {course && (
            <div style={{ padding: '16px 20px', background: 'rgba(123,94,167,0.08)', border: '1px solid rgba(123,94,167,0.2)', borderRadius: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--violet-bright)', marginBottom: 6 }}>Enrolling in:</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 4 }}>{course.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>by {course.tutor?.name}</span>
                <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>₹{course.price}</span>
              </div>
            </div>
          )}

          {/* Order summary */}
          <div style={{ marginBottom: 24 }}>
            {[
              ['Course fee', `₹${course?.price || 0}`],
              ['Platform fee', '₹0'],
              ['GST (18%)', `₹${Math.round((course?.price || 0) * 0.18)}`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 16, fontWeight: 800 }}>
              <span style={{ color: 'white' }}>Total</span>
              <span style={{ color: 'var(--gold)' }}>₹{Math.round((course?.price || 0) * 1.18)}</span>
            </div>
          </div>

          <button onClick={handleRazorpay} disabled={loading || !courseId} style={{ width: '100%', padding: '15px', background: loading ? 'rgba(123,94,167,0.3)' : 'linear-gradient(135deg,#7b5ea7,#e8547a)', border: 'none', borderRadius: 14, color: 'white', cursor: loading ? 'wait' : 'pointer', fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-body)', boxShadow: '0 4px 24px rgba(123,94,167,0.4)', marginBottom: 12, transition: 'all 0.2s' }}>
            {loading ? '⏳ Processing...' : '💳 Pay Securely with Razorpay'}
          </button>

          <button onClick={handleDemo} disabled={loading} style={{ width: '100%', padding: '12px', background: 'rgba(45,224,142,0.08)', border: '1px solid rgba(45,224,142,0.2)', borderRadius: 14, color: 'var(--green)', cursor: loading ? 'wait' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
            🧪 Demo Payment (Test Mode — No real money)
          </button>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 16 }}>
            {['🔒 SSL Secured', '↩️ 7-day refund', '🇮🇳 UPI / Cards'].map(b => (
              <span key={b} style={{ fontSize: 11, color: 'var(--text-dim)' }}>{b}</span>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-dim)' }}>
          For demo: use card <strong style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>4111 1111 1111 1111</strong>, any future expiry, any CVV
        </p>
      </div>
    </div>
  );
}
