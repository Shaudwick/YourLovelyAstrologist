const { Resend } = require('resend');

const OWNER_EMAIL = 'Whissspernuance@gmail.com';

const PACKAGES = {
  'Daily Reading': { price: '$11.11', duration: '15–20 minutes' },
  'Weekly Reading': { price: '$33.33', duration: '30 minutes' },
  'Monthly Reading': { price: '$55.55', duration: '1 hour' },
  'Tarot Reading': { price: '—', duration: '—' }
};

function getPackageInfo(packageName) {
  return PACKAGES[packageName] || PACKAGES['Tarot Reading'];
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function customerEmailHtml(data) {
  const d = { ...data };
  Object.keys(d).forEach(k => { if (typeof d[k] === 'string') d[k] = escapeHtml(d[k]); });
  const { user_name, package_name, dateTime, amount, duration } = d;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:Georgia,serif;background:linear-gradient(to bottom,#0f0f23,#1e1b4b,#0f0f23);color:#e2e8f0;padding:24px;min-height:100vh">
  <div style="max-width:520px;margin:0 auto;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.4);border-radius:24px;padding:40px">
    <p style="font-size:48px;text-align:center;margin:0 0 16px">✨</p>
    <h1 style="font-size:28px;text-align:center;background:linear-gradient(90deg,#e9d5ff,#fbcfe8,#e9d5ff);-webkit-background-clip:text;color:transparent;margin:0 0 8px">Your Reading Is Confirmed</h1>
    <p style="text-align:center;color:#94a3b8;margin:0 0 32px">Whisper Nuance — whispernuance.com</p>
    <div style="background:rgba(0,0,0,0.3);border-radius:16px;padding:24px;margin:24px 0">
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Name:</strong> ${user_name}</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Package:</strong> ${package_name}</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Amount paid:</strong> ${amount}</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Duration:</strong> ${duration}</p>
      <p style="margin:0"><strong style="color:#c4b5fd">Date & time:</strong> ${dateTime}</p>
    </div>
    <p style="color:#cbd5e1;line-height:1.6">The cards have aligned with your journey. We'll be in touch with your personalized reading.</p>
    <p style="color:#94a3b8;font-size:14px;margin-top:32px">Questions? Reply to this email or contact Whissspernuance@gmail.com</p>
  </div>
</body>
</html>`;
}

function ownerEmailHtml(data) {
  const d = { ...data };
  Object.keys(d).forEach(k => { if (typeof d[k] === 'string') d[k] = escapeHtml(d[k]); });
  const { user_name, user_email, user_phone, package_name, dateTime, amount, duration, message } = d;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:Georgia,serif;background:linear-gradient(to bottom,#0f0f23,#1e1b4b,#0f0f23);color:#e2e8f0;padding:24px;min-height:100vh">
  <div style="max-width:520px;margin:0 auto;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.4);border-radius:24px;padding:40px">
    <p style="font-size:48px;text-align:center;margin:0 0 16px">🔮</p>
    <h1 style="font-size:28px;text-align:center;background:linear-gradient(90deg,#e9d5ff,#fbcfe8,#e9d5ff);-webkit-background-clip:text;color:transparent;margin:0 0 8px">New Booking</h1>
    <p style="text-align:center;color:#94a3b8;margin:0 0 32px">Whisper Nuance</p>
    <div style="background:rgba(0,0,0,0.3);border-radius:16px;padding:24px;margin:24px 0">
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Customer:</strong> ${user_name}</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Email:</strong> ${user_email}</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Phone:</strong> ${user_phone || '—'}</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Package:</strong> ${package_name} (${amount})</p>
      <p style="margin:0 0 12px"><strong style="color:#c4b5fd">Duration:</strong> ${duration}</p>
      <p style="margin:0"><strong style="color:#c4b5fd">Date & time:</strong> ${dateTime}</p>
      ${message ? `<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1)"><strong style="color:#c4b5fd">Guidance sought:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
    </div>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured. Add RESEND_API_KEY in Vercel.' });
  }

  const { user_name, user_email, user_phone, package_name, booking_date, booking_time, message } = req.body || {};
  if (!user_name || !user_email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const pkgName = package_name || 'Tarot Reading';
  const pkgInfo = getPackageInfo(pkgName);
  const dateTime = [booking_date, booking_time].filter(Boolean).join(' at ') || 'As requested';

  const resend = new Resend(apiKey);

  const [customerRes, ownerRes] = await Promise.all([
    resend.emails.send({
      from: 'Whisper Nuance <onboarding@resend.dev>',
      to: user_email,
      subject: `Your Whisper Nuance Reading Is Confirmed — ${dateTime}`,
      html: customerEmailHtml({
        user_name,
        user_email,
        package_name: pkgName,
        dateTime,
        amount: pkgInfo.price,
        duration: pkgInfo.duration
      })
    }),
    resend.emails.send({
      from: 'Whisper Nuance <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `New booking: ${pkgName} — ${user_name}`,
      html: ownerEmailHtml({
        user_name,
        user_email,
        user_phone,
        package_name: pkgName,
        dateTime,
        amount: pkgInfo.price,
        duration: pkgInfo.duration,
        message: message || ''
      })
    })
  ]);

  const err = customerRes.error || ownerRes.error;
  if (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send confirmation email' });
  }

  return res.status(200).json({ ok: true });
}
