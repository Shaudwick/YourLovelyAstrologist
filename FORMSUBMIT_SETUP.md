# FormSubmit Setup — Whisper Nuance

The success page now uses [FormSubmit](https://formsubmit.co) — **no API keys or serverless functions**. It works as soon as you verify your email.

## One-time setup (about 1 minute)

1. Submit the form once on the live site (or have someone do a test submission).
2. FormSubmit sends a **verification email** to Whissspernuance@gmail.com.
3. Click the verification link in that email.
4. Done. All future submissions will work.

## What each party receives

- **Whissspernuance@gmail.com** — Full form data (name, email, phone, package, date/time, message) in a table format
- **Customer** — Auto-reply: "Thank you! Your Whisper Nuance reading is confirmed..."

## Notes

- FormSubmit is free with no monthly limit for basic use
- Works regardless of Vercel Root Directory setting
- No environment variables or API keys needed
