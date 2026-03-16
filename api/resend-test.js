const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY; // TODO: replace re_xxxxxxxxx with your real key in Vercel env vars
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY in environment' });
  }

  const { to = 'Whissspernuance@gmail.com' } = req.body || {};

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: 'Whisper Nuance <onboarding@resend.dev>',
    to,
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
  });

  if (error) {
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }

  return res.status(200).json({ id: data?.id || null, ok: true });
};
